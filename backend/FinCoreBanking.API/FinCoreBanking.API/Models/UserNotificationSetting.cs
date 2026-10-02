namespace FinCoreBanking.API.Models;

public class UserNotificationSetting
{
    // Stores the notification setting ID.
    public int NotificationSettingId { get; set; }

    // Stores the associated user ID.
    public int UserId { get; set; }

    // Controls transaction notifications.
    public bool TransactionAlerts { get; set; }

    // Controls login notifications.
    public bool LoginAlerts { get; set; }

    // Controls promotional notifications.
    public bool PromotionalNotifications { get; set; }

    // Stores the creation date.
    public DateTime CreatedDate { get; set; }

    // Stores the last modified date.
    public DateTime? ModifiedDate { get; set; }
}