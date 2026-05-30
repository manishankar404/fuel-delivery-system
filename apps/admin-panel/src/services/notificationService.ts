export const sendPushNotification =
  async (
    expoPushToken: string,
    title: string,
    body: string
  ) => {
    try {
      await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',

          headers: {
            Accept:
              'application/json',

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            to: expoPushToken,

            sound: 'default',

            title,

            body,
          }),
        }
      );
    } catch (error) {
      console.log(error);
    }
  };