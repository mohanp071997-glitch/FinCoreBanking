import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Card } from '../../interfaces/card.interface';
import { CardService } from '../../services/card.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent implements OnInit {

  cards: Card[] = [];
  // Controls card number visibility.
  showCardNumber = false;
  // Controls the confirmation popup.
  showStatusPopup = false;

  // Stores the selected card.
  selectedCard: Card | null = null;

  constructor(private cardService: CardService, private router: Router) {}

  // Loads cards for the logged-in customer.
  ngOnInit(): void {
    this.loadCards();
  }

  // Gets cards from the backend API.
  loadCards(): void {
    this.cardService.getCurrentCards().subscribe({
      next: (response) => {
        this.cards = response;
        console.log('Cards loaded:', response);
      },
      error: (error) => {
        console.error('Failed to load cards:', error);
      }
    });
  }

  // Toggles card number visibility.
  toggleCardNumber(): void {
    this.showCardNumber = !this.showCardNumber;
  }

   // Opens the card status confirmation popup.
  updateCardStatus(card: Card): void {
    this.selectedCard = card;
    this.showStatusPopup = true;
  }

  // Closes the confirmation popup.
  closeStatusPopup(): void {
    this.showStatusPopup = false;
    this.selectedCard = null;
  }

  // Confirms the card status update.
  confirmStatusUpdate(): void {

    if (!this.selectedCard) {
      return;
    }

    const newStatus = this.selectedCard.cardStatus === 'Active'
      ? 'Blocked'
      : 'Active';

    this.cardService.updateCardStatus(
      this.selectedCard.cardId,
      newStatus
    ).subscribe({
      next: (response) => {

        this.selectedCard!.cardStatus = response.cardStatus;

        console.log(
          'Card status updated:',
          response
        );

        this.closeStatusPopup();
      },
      error: (error) => {
        console.error(
          'Failed to update card status:',
          error
        );
      }
    });
  }

  // Calculates the percentage of the card limit that has been used.
  getCardUsagePercentage(card: Card): number {

    const usedAmount = Number(card.usedAmount || 0);

    const availableLimit = Number(card.availableLimit || 0);

    const totalLimit = usedAmount + availableLimit;

    if (totalLimit <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (usedAmount / totalLimit) * 100
      )
    );
  }

  // Calculates the total card limit.
  getTotalCardLimit(card: Card): number {

    return (
      Number(card.availableLimit || 0) +
      Number(card.usedAmount || 0)
    );
  }

  // Navigates to the selected card details page.
  viewCardDetails(card: Card): void {

    if (!card || !card.cardId) {
      return;
    }

    this.router.navigate([
      '/cards',
      card.cardId
    ]);
  }

  // Opens the add new card flow.
  addNewCard(): void {

    console.log('Add New Card clicked');

  }

  // Navigates back to the dashboard.
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

}