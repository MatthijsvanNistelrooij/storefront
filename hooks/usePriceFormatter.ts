const usePriceFormatter = () => {
    return (amount?: string, currency?: string) => {
      if (!amount) return "-";
      return `${currency || "€"} ${parseFloat(amount).toFixed(2)}`;
    };
  };
  
  export default usePriceFormatter;
  