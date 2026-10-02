namespace FinCoreBanking.API.DTOs;

public class UpdateNotificationSettingsRequest
{
    // Controls transaction alerts.
    public bool TransactionAlerts { get; set; }

    // Controls login alerts.
    public bool LoginAlerts { get; set; }

    // Controls promotional notifications.
    public bool PromotionalNotifications { get; set; }
}