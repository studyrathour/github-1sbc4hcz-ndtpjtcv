const USER_NAME_KEY = 'edumaster_user_name';
const USER_ID_KEY = 'edumaster_user_id';

export class UserStorage {
  static getUserName(): string | null {
    try {
      return localStorage.getItem(USER_NAME_KEY);
    } catch (error) {
      console.error('Error reading user name from localStorage:', error);
      return null;
    }
  }

  static setUserName(name: string): void {
    try {
      localStorage.setItem(USER_NAME_KEY, name);
    } catch (error) {
      console.error('Error saving user name to localStorage:', error);
    }
  }

  static getUserId(): string {
    try {
      let userId = localStorage.getItem(USER_ID_KEY);
      if (!userId) {
        userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(USER_ID_KEY, userId);
      }
      return userId;
    } catch (error) {
      console.error('Error with user ID in localStorage:', error);
      return `user_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  static clearUserData(): void {
    try {
      localStorage.removeItem(USER_NAME_KEY);
      localStorage.removeItem(USER_ID_KEY);
    } catch (error) {
      console.error('Error clearing user data from localStorage:', error);
    }
  }
}