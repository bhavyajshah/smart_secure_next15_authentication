import { IUser, INotification } from '@/lib/models/user';
import { sendMail } from '@/lib/mail';

export const createNotification: any = async (
  user: IUser,
  type: 'security' | 'info' | 'warning',
  title: string,
  message: string
) => {
  const notification: INotification = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    title,
    message,
    read: false,
    createdAt: new Date(),
  };

  user.notifications.push(notification);
  await user.save();

  if (user.preferences.emailNotifications) {
    await sendMail(
      user.email,
      title,
      `
        <div>
          <h1>${title}</h1>
          <p>${message}</p>
        </div>
      `
    );
  }

  return notification;
};

export const markNotificationAsRead = async (
  user: IUser,
  notificationId: string
) => {
  const notification = user.notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    await user.save();
  }
  return notification;
};

export const deleteNotification = async (
  user: IUser,
  notificationId: string
) => {
  user.notifications = user.notifications.filter(n => n.id !== notificationId);
  await user.save();
};