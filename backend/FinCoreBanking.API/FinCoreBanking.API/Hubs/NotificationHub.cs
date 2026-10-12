using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FinCoreBanking.API.Hubs
{
    // FEATURE: Real-time reviewer notifications
    [Authorize(Roles = "Reviewer")]
    public class NotificationHub : Hub
    {
        private const string ReviewerGroup = "reviewers";

        // FEATURE: Add authenticated reviewers to notification group
        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                ReviewerGroup
            );

            await base.OnConnectedAsync();
        }

        // FEATURE: Remove reviewer from group on disconnect
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                ReviewerGroup
            );

            await base.OnDisconnectedAsync(exception);
        }
    }
}