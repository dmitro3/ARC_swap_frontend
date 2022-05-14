import React from 'react';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const AllowTokenButton: React.FC<{
  loading: boolean;
  token: any;
  onClick: () => void;
}> = ({ loading = false, token, onClick }) => (
  <Button
    disabled={loading}
    onClick={onClick}
    className={`btn-depo ${!loading ? 'bg-success' : 'bg-secondary'} mx-1`}
  >
    {loading ? (
      <>
        <LoadingOutlined /> Waiting {token.symbol}
      </>
    ) : (
      <>Allow {token.symbol}</>
    )}
  </Button>
);

export default AllowTokenButton;
