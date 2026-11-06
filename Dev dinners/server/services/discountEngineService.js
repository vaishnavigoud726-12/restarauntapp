/**
 * Personalized Discount Engine Service
 *
 * Evaluates customer segmentation dynamically based on:
 * - Completed visit counts
 * - Cumulative spending
 * - Date of birth (Birthday month)
 * - Days since last reservation (Inactive)
 * Matches eligible discount rules and injects "Why am I getting this offer?" explanations.
 */

/**
 * Computes customer segment dynamically based on user history
 */
function evaluateCustomerSegment(customer, completedVisitsCount = 0, totalSpent = 0) {
  const now = new Date();

  // 1. Birthday Check
  if (customer.dateOfBirth) {
    const dob = new Date(customer.dateOfBirth);
    if (dob.getMonth() === now.getMonth()) {
      return 'birthday';
    }
  }

  // 2. New Customer Check (< 1 completed visit)
  if (completedVisitsCount === 0) {
    return 'new';
  }

  // 3. Loyal Customer Check (> 5 completed visits or high spend > ₹5000)
  if (completedVisitsCount >= 5 || totalSpent >= 5000) {
    return 'loyal';
  }

  // 4. High-spending customer
  if (totalSpent >= 3000) {
    return 'high_spending';
  }

  // 5. Regular customer (2 - 4 visits)
  if (completedVisitsCount >= 2) {
    return 'regular';
  }

  // Default segment
  return 'regular';
}

/**
 * Filters and validates active discounts that a specific customer qualifies for
 */
function filterEligibleDiscounts(allDiscounts, customer, userUsages = [], restaurantId = null) {
  const now = new Date();

  const eligibleOffers = allDiscounts.filter((discount) => {
    // 1. Check active status
    if (!discount.isActive) return false;

    // 2. Check date validity
    const validFrom = new Date(discount.validFrom);
    const validUntil = new Date(discount.validUntil);
    if (now < validFrom || now > validUntil) return false;

    // 3. Check restaurant scope (if restaurantId provided)
    if (restaurantId && discount.restaurantId) {
      if (discount.restaurantId.toString() !== restaurantId.toString()) {
        return false;
      }
    }

    // 4. Check global usage limit
    if (discount.currentUsageCount >= discount.totalUsageLimit) {
      return false;
    }

    // 5. Check per-customer usage limit
    const customerUsages = userUsages.filter(
      (u) => u.discountId.toString() === discount._id.toString()
    ).length;
    if (customerUsages >= discount.usageLimitPerCustomer) {
      return false;
    }

    // 6. Check target customer segment
    const segment = customer ? customer.segment : 'new';
    if (discount.targetSegment !== 'all' && discount.targetSegment !== segment) {
      return false;
    }

    return true;
  });

  return eligibleOffers.map((d) => ({
    _id: d._id,
    code: d.code,
    title: d.title,
    description: d.description,
    discountType: d.discountType,
    discountValue: d.discountValue,
    minBillAmount: d.minBillAmount,
    maxDiscountAmount: d.maxDiscountAmount,
    validUntil: d.validUntil,
    targetSegment: d.targetSegment,
    restaurantId: d.restaurantId,
    whyExplanation: d.whyExplanation,
  }));
}

/**
 * Validates a discount code for a specific bill amount and customer
 */
function applyDiscountCalculation(discount, billAmount) {
  if (billAmount < discount.minBillAmount) {
    return {
      isValid: false,
      reason: `Minimum bill of ₹${discount.minBillAmount} required for this offer.`,
      discountAmount: 0,
      payableAmount: billAmount,
    };
  }

  let discountAmount = 0;
  if (discount.discountType === 'percentage') {
    const raw = (billAmount * discount.discountValue) / 100;
    discountAmount = Math.min(raw, discount.maxDiscountAmount || 500);
  } else {
    discountAmount = Math.min(discount.discountValue, billAmount);
  }

  discountAmount = Math.round(discountAmount);
  const payableAmount = Math.max(0, billAmount - discountAmount);

  return {
    isValid: true,
    discountAmount,
    payableAmount,
    savingsText: `You saved ₹${discountAmount} with code ${discount.code}!`,
  };
}

module.exports = {
  evaluateCustomerSegment,
  filterEligibleDiscounts,
  applyDiscountCalculation,
};

