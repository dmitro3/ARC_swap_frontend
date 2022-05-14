/* eslint-disable camelcase */
import React, { useState, useEffect, useRef } from 'react';
import { Line } from '@ant-design/plots';
import { DepoAPISevice } from 'services/DepoAPIService';
import styled from 'styled-components';

const TickerPrice = styled.span`
  font-size: 26px;
  font-weight: 700;
`;

const TickerChange = styled.span<{ isUp: boolean }>`
  font-size: 18px;
  padding-left: 8px;
  color: ${(props) => (props.isUp ? '#06806b' : '#cc2f3c')};
`;

const GateIoChart: React.FC<{ currencyPair: string }> = ({ currencyPair }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [tickerPrice, setTickerPrice] = useState(0);
  const [tickerChange, setTickerChange] = useState(0);
  const [chartData, setChartData] = useState<any>([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const currencyPairRef = useRef<string>(currencyPair);

  const subscribe = (socket: WebSocket) =>
    socket.send(
      JSON.stringify({
        time: Date.now(),
        channel: 'spot.tickers',
        event: 'subscribe',
        payload: [currencyPair],
      }),
    );

  useEffect(() => {
    setIsLoading(true);
    currencyPairRef.current = currencyPair;
    const fetchData = async () => {
      let data: any[] = await DepoAPISevice.fetchGateioCandlesticks(
        currencyPair,
      );
      data = data.reverse().slice(0, 48).reverse();
      if (data.length > 0) {
        let min: number = +data[0][2];
        let max: number = +data[0][2];
        const chartData = data.map(([timestamp, volume, close]: any) => {
          min = Math.min(min, +close);
          max = Math.max(max, +close);
          const date = new Date(+timestamp * 1000);
          return {
            time: `${date.getHours()}:${date.getMinutes()}`,
            price: +close,
          };
        });
        setTickerPrice(+data[data.length - 1][2]);
        setTickerChange(0);
        setChartData(chartData);
        setMin(min);
        setMax(max);
        setIsLoading(false);
      }

      if (socket) {
        subscribe(socket);
      }
    };

    fetchData();
  }, [currencyPair]);

  useEffect(() => {
    if (!socket) {
      const ws = new WebSocket('wss://api.gateio.ws/ws/v4/');
      ws.onopen = () => subscribe(ws);
      ws.onmessage = (e: any) => {
        const { event, result } = JSON.parse(e.data);
        if (event === 'update') {
          const { change_percentage, last, currency_pair } = result;
          if (currency_pair === currencyPairRef.current) {
            setTickerPrice(+last);
            setTickerChange(+change_percentage);
          }
        }
      };
      setSocket(ws);
    }
  }, []);

  if (isLoading) return <div />;

  return (
    <>
      <div className="pl-3">
        <div>{currencyPair.replace('_', '')}</div>
        <div>
          <TickerPrice>{tickerPrice}</TickerPrice>
          {tickerChange !== 0 && (
            <TickerChange isUp={tickerChange >= 0}>
              {tickerChange}%
            </TickerChange>
          )}
        </div>
      </div>
      <Line
        data={chartData}
        xField="time"
        yField="price"
        xAxis={{
          tickCount: 10,
          tickLine: null,
          line: null,
        }}
        yAxis={{ tickCount: 0, min, max, label: null, tickLine: null }}
        color="#007aff"
        tooltip={false}
      />
    </>
  );
};

export default GateIoChart;
