import { Test, TestingModule } from '@nestjs/testing';
import {NotificationService} from "./notification.service";
import {NotificationController} from "./notification.controller";

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    notificationService = app.get<NotificationService>(NotificationController);
  });

  describe('notification service', () => {
    it('send push notification', async () => {
      const testPushToken = '' // TODO
      const res = await notificationService.sendPushNotification(testPushToken, "This is a test notification")

    })
  });
});
