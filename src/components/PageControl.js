import React from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { i18n } from '../locales/i18n';

const PageControl = ({ pageCount, onPageCountChange }) => {
  const handleDecrease = () => {
    if (pageCount > 1) {
      onPageCountChange(pageCount - 1);
    }
  };

  const handleIncrease = () => {
    if (pageCount < 10) { 
      onPageCountChange(pageCount + 1);
    }
  };

  return (
    <div className="page-control">
      <button 
        onClick={handleDecrease}
        disabled={pageCount <= 1}
        className="page-control-button"
      >
        <FiMinus />
      </button>
      <div className="page-count">
        {pageCount} {i18n.t('pageControl.pages')}
      </div>
      <button 
        onClick={handleIncrease}
        disabled={pageCount >= 10}
        className="page-control-button"
      >
        <FiPlus />
      </button>
    </div>
  );
};

export default PageControl; 