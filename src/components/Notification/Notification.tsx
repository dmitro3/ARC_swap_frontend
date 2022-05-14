import React from 'react';
import { notification, Button, Typography } from 'antd';
import { INotification } from '../../interfaces/INotification';
import './styles.scss';

const Notification = ({
  type,
  title = undefined,
  message,
  txnLink,
}: INotification): void => {
  const { Link } = Typography;
  notification.open({
    type,
    message: title,
    description: txnLink ? (
      <div>
        <Typography>{message}</Typography>
        <Link href={`https://etherscan.io/tx/${txnLink}`} target="_blank">
          {txnLink}
        </Link>
      </div>
    ) : (
      message
    ),
    className: 'notification',
  });
};

export default Notification;
