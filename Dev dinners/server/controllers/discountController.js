const Discount = require('../models/Discount');
const DiscountUsage = require('../models/DiscountUsage');
const Customer = require('../models/Customer');
const {
  filterEligibleDiscounts,
  applyDiscountCalculation,
  evaluateCustomerSegment,
} = require('../services/discountEngineService');

/**
 * @desc    Get eligible personalized discounts for logged-in customer
 * @route   GET /api/discounts/my-eligible-offers
 * @access  Private (Customer)
 */
exports.getMyEligibleDiscounts = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const customer = await Customer.findById(req.user._id);

    // Refresh dynamic segment if needed
    const usages = await DiscountUsage.find({ customerId: req.user._id });
    const computedSegment = evaluateCustomerSegment(
      customer,
      customer.totalCompletedVisits || 0,
      customer.totalSavings || 0
    );

    if (customer.segment !== computedSegment) {
      customer.segment = computedSegment;
      await customer.save();
    }

    const allDiscounts = await Discount.find({ isActive: true });
    const eligible = filterEligibleDiscounts(allDiscounts, customer, usages, restaurantId);

    res.status(200).json({
      success: true,
      customerSegment: customer.segment,
      eligibleCount: eligible.length,
      data: eligible,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Validate a discount code against a specific bill amount
 * @route   POST /api/discounts/validate
 * @access  Public / Customer
 */
exports.validateDiscountCode = async (req, res, next) => {
  try {
    const { code, billAmount, restaurantId } = req.body;

    if (!code || !billAmount) {
      return res.status(400).json({ success: false, error: 'Please provide code and billAmount.' });
    }

    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!discount) {
      return res.status(404).json({ success: false, error: 'Invalid or expired discount code.' });
    }

    // Check restaurant validity if scoped
    if (discount.restaurantId && restaurantId) {
      if (discount.restaurantId.toString() !== restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'This discount offer is only valid at a specific partner restaurant.',
        });
      }
    }

    const result = applyDiscountCalculation(discount, parseFloat(billAmount));

    if (!result.isValid) {
      return res.status(400).json({ success: false, error: result.reason });
    }

    res.status(200).json({
      success: true,
      message: result.savingsText,
      data: {
        code: discount.code,
        title: discount.title,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        discountAmount: result.discountAmount,
        finalPayable: result.payableAmount,
        whyExplanation: discount.whyExplanation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: List all discount rules
 * @route   GET /api/discounts/admin/all
 * @access  Private (Super Admin)
 */
exports.getAllDiscountsAdmin = async (req, res, next) => {
  try {
    const discounts = await Discount.find()
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Create new discount rule
 * @route   POST /api/discounts/admin
 * @access  Private (Super Admin)
 */
exports.createDiscountRule = async (req, res, next) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minBillAmount,
      maxDiscountAmount,
      validUntil,
      targetSegment,
      restaurantId,
      whyExplanation,
      usageLimitPerCustomer,
      totalUsageLimit,
    } = req.body;

    const discount = await Discount.create({
      code: code.toUpperCase(),
      title,
      description,
      discountType,
      discountValue,
      minBillAmount: minBillAmount || 0,
      maxDiscountAmount: maxDiscountAmount || 500,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      targetSegment: targetSegment || 'all',
      restaurantId: restaurantId || null,
      whyExplanation: whyExplanation || 'Special promotional dining reward.',
      usageLimitPerCustomer: usageLimitPerCustomer || 1,
      totalUsageLimit: totalUsageLimit || 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Discount rule created successfully.',
      data: discount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Delete or toggle discount status
 * @route   DELETE /api/discounts/admin/:id
 * @access  Private (Super Admin)
 */
exports.toggleDiscountStatus = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    res.status(200).json({
      success: true,
      message: `Discount is now ${discount.isActive ? 'active' : 'inactive'}`,
      data: discount,
    });
  } catch (error) {
    next(error);
  }
};

