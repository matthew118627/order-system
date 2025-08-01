import React from 'react'
import './Menu.css'

const Menu = ({ items, onAddToOrder }) => {
  return (
    <div className="menu">
      <h2>菜單</h2>
      <div className="menu-grid">
        {items.map(item => (
          <div key={item.id} className="menu-item" onClick={() => onAddToOrder(item)}>
            <div className="menu-item-content">
              <h3>{item.name}</h3>
              <p>${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Menu
