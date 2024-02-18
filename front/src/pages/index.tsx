const HomePage = () => {
  const numsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return (
    <>
      {numsArray.map((num) => (
        <h1 key={num} className=" h-20">
          {num}
        </h1>
      ))}
    </>
  );
};

export default HomePage;
