const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const Restaurant = require('../models/Restaurant');
const Admin = require('../models/Admin');

/**
 * Generate signed JWT Token
 */
const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || 'cravewise_msd_university_secret_key_2026',
    { expiresIn: '30d' }
  );
};

const getGitHubStateCookie = (req) => {
  const cookies = (req.headers.cookie || '').split(';');
  const stateCookie = cookies.find((cookie) => cookie.trim().startsWith('github_oauth_state='));
  return stateCookie ? stateCookie.trim().slice('github_oauth_state='.length) : '';
};

const clearGitHubStateCookie = (res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `github_oauth_state=; HttpOnly; SameSite=Lax; Path=/api/auth/github/callback; Max-Age=0${secure}`
  );
};

const redirectToLoginWithError = (res) => {
  const loginUrl = new URL('/login', process.env.CLIENT_URL || 'http://localhost:5173');
  loginUrl.searchParams.set('oauth_error', 'GitHub sign-in failed. Please try again.');
  return res.redirect(loginUrl.toString());
};

/**
 * @desc    Begin GitHub OAuth for customer accounts
 * @route   GET /api/auth/github
 * @access  Public
 */
exports.startGitHubOAuth = (req, res) => {
  const { GITHUB_CLIENT_ID: clientId } = process.env;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
    return res.status(503).json({
      success: false,
      error: 'GitHub sign-in is not configured. Set its credentials in server/.env.',
    });
  }

  const state = crypto.randomBytes(32).toString('hex');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/api/auth/github/callback; Max-Age=600${secure}`
  );

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', process.env.GITHUB_CALLBACK_URL);
  authorizeUrl.searchParams.set('scope', 'read:user user:email');
  authorizeUrl.searchParams.set('state', state);
  return res.redirect(authorizeUrl.toString());
};

/**
 * @desc    Complete GitHub OAuth and create or authenticate a customer
 * @route   GET /api/auth/github/callback
 * @access  Public
 */
exports.completeGitHubOAuth = async (req, res) => {
  const expectedState = getGitHubStateCookie(req);
  clearGitHubStateCookie(res);

  const receivedState = typeof req.query.state === 'string' ? req.query.state : '';
  if (
    !/^[a-f0-9]{64}$/.test(expectedState) ||
    !/^[a-f0-9]{64}$/.test(receivedState) ||
    !crypto.timingSafeEqual(Buffer.from(expectedState), Buffer.from(receivedState))
  ) {
    return redirectToLoginWithError(res);
  }

  if (typeof req.query.error === 'string' || typeof req.query.code !== 'string') {
    return redirectToLoginWithError(res);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });
    if (!tokenResponse.ok) {
      throw new Error(`GitHub token exchange failed with status ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('GitHub did not return an access token');
    }

    const githubHeaders = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'CraveWise',
    };
    const [profileResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', { headers: githubHeaders }),
      fetch('https://api.github.com/user/emails', { headers: githubHeaders }),
    ]);
    if (!profileResponse.ok || !emailsResponse.ok) {
      throw new Error('Could not retrieve the verified GitHub account profile');
    }

    const [githubUser, githubEmails] = await Promise.all([
      profileResponse.json(),
      emailsResponse.json(),
    ]);
    const verifiedEmail = githubEmails.find((item) => item.primary && item.verified)
      || githubEmails.find((item) => item.verified);
    if (!verifiedEmail?.email || !githubUser.id) {
      throw new Error('GitHub did not provide a verified email address');
    }

    let customer = await Customer.findOne({ githubId: String(githubUser.id) });
    if (!customer) {
      // GitHub verified the email, so an existing customer account can be linked safely.
      customer = await Customer.findOne({ email: verifiedEmail.email.toLowerCase() });
      if (customer) {
        customer.githubId = String(githubUser.id);
        await customer.save();
      } else {
        customer = await Customer.create({
          fullName: githubUser.name || githubUser.login,
          email: verifiedEmail.email.toLowerCase(),
          password: crypto.randomBytes(32).toString('hex'),
          githubId: String(githubUser.id),
          avatarUrl: githubUser.avatar_url,
        });
      }
    }

    if (customer.accountStatus === 'suspended') {
      return redirectToLoginWithError(res);
    }

    const token = generateToken(customer._id, 'customer', customer.email);
    const callbackUrl = new URL('/auth/github/callback', process.env.CLIENT_URL || 'http://localhost:5173');
    callbackUrl.hash = new URLSearchParams({ token }).toString();
    return res.redirect(callbackUrl.toString());
  } catch (error) {
    console.error(`[GitHub OAuth] ${error.message}`);
    return redirectToLoginWithError(res);
  }
};

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, dietaryPreferences, favouriteCuisines } = req.body;

    // Check if email already registered in Customer or Restaurant
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ success: false, error: 'Email already registered as a customer.' });
    }

    const customer = await Customer.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      dietaryPreferences: dietaryPreferences || ['Veg', 'Non-Veg'],
      favouriteCuisines: favouriteCuisines || ['Hyderabadi', 'North Indian'],
      loyaltyPoints: 100, // 100 Welcome Points
    });

    const token = generateToken(customer._id, 'customer', customer.email);

    res.status(201).json({
      success: true,
      message: 'Welcome to CraveWise! Customer registration successful.',
      data: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        role: 'customer',
        loyaltyPoints: customer.loyaltyPoints,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new restaurant owner
 * @route   POST /api/auth/register-restaurant
 * @access  Public
 */
exports.registerRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      ownerName,
      email,
      password,
      phone,
      cuisineTypes,
      priceForTwo,
      area,
      coordinates, // [lng, lat]
      openingTime,
      closingTime,
      diningStyle,
    } = req.body;

    const existing = await Restaurant.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered for a restaurant.' });
    }

    const restaurant = await Restaurant.create({
      name,
      ownerName: ownerName || name + ' Management',
      email: email.toLowerCase(),
      password,
      phone,
      cuisineTypes: cuisineTypes || ['Multi-Cuisine'],
      priceForTwo: priceForTwo || 800,
      address: {
        street: area + ', Hyderabad',
        area: area || 'Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
      },
      location: {
        type: 'Point',
        coordinates: coordinates || [78.3846, 17.4486], // Default Hyderabad coords
      },
      openingTime: openingTime || '11:00',
      closingTime: closingTime || '23:00',
      diningStyle: diningStyle || 'Casual Dining',
      approvalStatus: 'approved',
    });

    const token = generateToken(restaurant._id, 'restaurant_owner', restaurant.email);

    res.status(201).json({
      success: true,
      message: 'Restaurant registered successfully!',
      data: {
        _id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        role: 'restaurant_owner',
        approvalStatus: restaurant.approvalStatus,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate User (Customer, Restaurant Owner, or Admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role = 'customer' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    let user = null;
    let userRole = role;

    // Search corresponding model based on chosen role or fallback
    if (role === 'customer') {
      user = await Customer.findOne({ email: email.toLowerCase() });
    } else if (role === 'restaurant_owner') {
      user = await Restaurant.findOne({ email: email.toLowerCase() });
    } else if (role === 'super_admin') {
      user = await Admin.findOne({ email: email.toLowerCase() });
    }

    // Auto fallback search if not found in target collection
    if (!user) {
      const maybeCustomer = await Customer.findOne({ email: email.toLowerCase() });
      if (maybeCustomer) {
        user = maybeCustomer;
        userRole = 'customer';
      } else {
        const maybeOwner = await Restaurant.findOne({ email: email.toLowerCase() });
        if (maybeOwner) {
          user = maybeOwner;
          userRole = 'restaurant_owner';
        } else {
          const maybeAdmin = await Admin.findOne({ email: email.toLowerCase() });
          if (maybeAdmin) {
            user = maybeAdmin;
            userRole = 'super_admin';
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
    }

    // Verify hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. Incorrect password.' });
    }

    // Check account status if customer or restaurant
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
    }
    if (user.approvalStatus === 'frozen') {
      return res.status(403).json({ success: false, error: 'Restaurant account is temporarily frozen.' });
    }

    const token = generateToken(user._id, userRole, user.email);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        _id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        role: userRole,
        loyaltyPoints: user.loyaltyPoints,
        avatarUrl: user.avatarUrl || user.images?.[0],
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Customer Profile (dietary, preferences, location)
 * @route   PUT /api/auth/profile
 * @access  Private (Customer)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, dietaryPreferences, favouriteCuisines, budgetPreference, savedLocation } = req.body;

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    if (fullName) customer.fullName = fullName;
    if (phone) customer.phone = phone;
    if (dietaryPreferences) customer.dietaryPreferences = dietaryPreferences;
    if (favouriteCuisines) customer.favouriteCuisines = favouriteCuisines;
    if (budgetPreference) customer.budgetPreference = budgetPreference;
    if (savedLocation) customer.savedLocation = savedLocation;

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
