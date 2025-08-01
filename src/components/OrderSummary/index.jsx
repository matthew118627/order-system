import React, { useRef } from 'react'
import { FaPrint, FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'
import './OrderSummary.css'

const OrderSummary = ({ items, onAdd, onRemove, onClear, total }) => {
  const componentRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page { 
        size: 80mm 100%;
        margin: 0;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
          width: 80mm;
        }
      }
    `
  })

  return (
    <div className="order-summary">
      <div className="order-header">
        <h2>訂單明細</h2>
        <button onClick={handlePrint} className="print-button">
          <FaPrint /> 列印
        </button>
      </div>
      
      <div className="order-items" ref={componentRef}>
        <div className="receipt">
          <div className="receipt-header">
            <h2>餐廳點餐單</h2>
            <p>訂單編號: {new Date().getTime()}</p>
            <p>時間: {new Date().toLocaleString()}</p>
          </div>
          
          <div className="receipt-items">
            {items.length === 0 ? (
              <p className="empty-order">尚未點餐</p>
            ) : (
              <>
                {items.map(item => (
                  <div key={item.id} className="receipt-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">${item.price} x {item.quantity}</span>
                    </div>
                    <span className="item-total">${item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="receipt-total">
                  <span>總計:</span>
                  <span>${total}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="order-controls">
        <button 
          onClick={onClear} 
          className="clear-button"
          disabled={items.length === 0}
        >
          <FaTrash /> 清空
        </button>
      </div>
    </div>
  )
}

export default OrderSummary
