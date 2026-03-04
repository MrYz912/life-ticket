import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovieTicket, Feedback } from '../types';

const TICKETS_KEY = '@lifeticket:tickets';
const FAVORITES_KEY = '@lifeticket:favorites';
const FEEDBACK_KEY = '@lifeticket:feedback';
const PROFILE_KEY = '@lifeticket:profile';
const SEARCH_HISTORY_KEY = '@lifeticket:search_history';

const MAX_SEARCH_HISTORY = 10;

export const TicketStorage = {
  async getAll(): Promise<MovieTicket[]> {
    try {
      const data = await AsyncStorage.getItem(TICKETS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading tickets:', error);
      return [];
    }
  },

  async save(ticket: MovieTicket): Promise<void> {
    try {
      const tickets = await this.getAll();
      tickets.unshift(ticket);
      await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    } catch (error) {
      console.error('Error saving ticket:', error);
      throw error;
    }
  },

  async update(ticket: MovieTicket): Promise<void> {
    try {
      const tickets = await this.getAll();
      const index = tickets.findIndex((t: MovieTicket) => t.id === ticket.id);
      if (index !== -1) {
        tickets[index] = ticket;
        await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  async delete(ticketId: string): Promise<void> {
    try {
      const tickets = await this.getAll();
      const filtered = tickets.filter((t: MovieTicket) => t.id !== ticketId);
      await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(filtered));
      
      const favorites = await this.getFavorites();
      const favoriteFiltered = favorites.filter((t: MovieTicket) => t.id !== ticketId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteFiltered));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  async getById(ticketId: string): Promise<MovieTicket | null> {
    try {
      const tickets = await this.getAll();
      return tickets.find((t: MovieTicket) => t.id === ticketId) || null;
    } catch (error) {
      console.error('Error getting ticket:', error);
      return null;
    }
  },

  async getCount(): Promise<number> {
    const tickets = await this.getAll();
    return tickets.length;
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TICKETS_KEY);
    } catch (error) {
      console.error('Error clearing tickets:', error);
      throw error;
    }
  },

  async getFavorites(): Promise<MovieTicket[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },

  async addFavorite(ticket: MovieTicket): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some((t: MovieTicket) => t.id === ticket.id);
      if (!exists) {
        favorites.unshift({ ...ticket, isFavorite: true });
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  async removeFavorite(ticketId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((t: MovieTicket) => t.id !== ticketId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  async isFavorite(ticketId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some((t: MovieTicket) => t.id === ticketId);
  },

  async getFavoriteCount(): Promise<number> {
    const favorites = await this.getFavorites();
    return favorites.length;
  },

  async saveFeedback(feedback: Feedback): Promise<void> {
    try {
      const feedbacks = await this.getFeedbacks();
      feedbacks.unshift(feedback);
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  },

  async getFeedbacks(): Promise<Feedback[]> {
    try {
      const data = await AsyncStorage.getItem(FEEDBACK_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      return [];
    }
  },

  async getProfile(): Promise<{ nickname: string; avatar: string }> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return { nickname: '电影爱好者', avatar: '' };
    } catch (error) {
      console.error('Error loading profile:', error);
      return { nickname: '电影爱好者', avatar: '' };
    }
  },

  async updateProfile(profile: { nickname: string; avatar: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getSearchHistory(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  },

  async addSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filtered = history.filter((item: string) => item !== query);
      filtered.unshift(query);
      const limited = filtered.slice(0, MAX_SEARCH_HISTORY);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error adding search history:', error);
      throw error;
    }
  },

  async removeSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filtered = history.filter((item: string) => item !== query);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing search history:', error);
      throw error;
    }
  },

  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  },
};
