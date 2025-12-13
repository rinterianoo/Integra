import { createContext, useState, useContext, useEffect } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [propina, setPropina] = useState(0);
  const [clienteNombre, setClienteNombre] = useState('');

  const agregarItem = (producto, cantidad = 1) => {
    setItems(prevItems => {
      const existente = prevItems.find(item => item.producto_id === producto.id);
      
      if (existente) {
        return prevItems.map(item =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      
      return [...prevItems, {
        producto_id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_unitario: producto.precio,
        cantidad: cantidad,
        descuento: 0
      }];
    });
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarItem(productoId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.producto_id === productoId
          ? { ...item, cantidad }
          : item
      )
    );
  };

  const eliminarItem = (productoId) => {
    setItems(prevItems => prevItems.filter(item => item.producto_id !== productoId));
  };

  const limpiarCarrito = () => {
    setItems([]);
    setDescuento(0);
    setPropina(0);
    setClienteNombre('');
  };

  const calcularSubtotal = () => {
    return items.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - descuento + propina;
  };

  const cargarOrden = (orden) => {
    setItems(orden.items || []);
    setDescuento(orden.descuento || 0);
    setPropina(orden.propina || 0);
    setClienteNombre(orden.clienteNombre || '');
  };

  return (
    <CarritoContext.Provider value={{
      items,
      descuento,
      propina,
      clienteNombre,
      agregarItem,
      actualizarCantidad,
      eliminarItem,
      limpiarCarrito,
      calcularSubtotal,
      calcularTotal,
      setDescuento,
      setPropina,
      setClienteNombre,
      cargarOrden
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};
