namespace Tracker.Domain;

// Enum tokens below match the OpenAPI contract exactly (UPPERCASE). They serialize to
// their member names via the configured JsonStringEnumConverter (Requirement 5.4).

/// <summary>Transaction and category flow direction. Contract: <c>INCOME</c> | <c>EXPENSE</c> | <c>TRANSFER</c>.</summary>
public enum FlowType
{
    INCOME,
    EXPENSE,
    TRANSFER
}

/// <summary>Recurring frequency for transactions. Contract: <c>MONTHLY</c> | <c>WEEKLY</c> | <c>YEARLY</c>.</summary>
public enum RecurringFrequency
{
    MONTHLY,
    WEEKLY,
    YEARLY
}

/// <summary>Financial account kind. Contract: <c>CASH</c> | <c>BANK</c> | <c>CREDIT_CARD</c> | <c>MOBILE_BANKING</c>.</summary>
public enum AccountType
{
    CASH,
    BANK,
    CREDIT_CARD,
    MOBILE_BANKING
}

/// <summary>Payment method for transactions. Contract: <c>CASH</c> | <c>BANK</c> | <c>MOBILE_BANKING</c> | <c>CREDIT_CARD</c>.</summary>
public enum PaymentMethod
{
    CASH,
    BANK,
    MOBILE_BANKING,
    CREDIT_CARD
}

/// <summary>Budget period. Contract: <c>MONTHLY</c> | <c>WEEKLY</c> | <c>YEARLY</c> | <c>CUSTOM</c>.</summary>
public enum BudgetPeriod
{
    MONTHLY,
    WEEKLY,
    YEARLY,
}

public enum GoalStatus
{
    IN_PROGRESS,
    COMPLETED,
    PAUSED,
    CANCELLED
}

public enum SubscriptionStatus
{
    ACTIVE,
    PAUSED,
    CANCELLED
}

public enum BillingCycle
{
    MONTHLY,
    YEARLY
}
