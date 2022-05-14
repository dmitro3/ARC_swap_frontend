import { Interface } from '@ethersproject/abi';

import getMulticallContract from './contractHelper';

interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (exemple: balanceOf)
  params?: any[]; // Function params
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const multicall = async (
  abi: any[],
  calls: Call[],
  web3Provider: string,
  chainId: number,
) => {
  const multi: any = getMulticallContract(web3Provider, chainId);
  const itf = new Interface(abi);
  const calldata = calls.map((call) => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name, call.params),
  ]);
  const { returnData } = await multi.methods.aggregate(calldata).call();
  const res = returnData.map((call: any, i: number) =>
    itf.decodeFunctionResult(calls[i].name, call),
  );
  return res;
};

export default multicall;
