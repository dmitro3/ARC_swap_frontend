async function wait(time: number): Promise<boolean> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, time),
  );
}

export default wait;
