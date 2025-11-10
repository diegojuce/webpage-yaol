import React, { useState } from 'react';

//crear una funcion que pregunte que tipo de envio desea a manera de checkbox con dos opciones de envio 
export function ShippingType() { 
    const [selectedShipping, setSelectedShipping] = useState<string>("store");

    const handleShippingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedShipping(event.target.value);
      };
    
return(
    
    <div className="mb-2 mx-7">
        <h3 className="text-sm font-semibold mb-2 text-yellow-600">Seleccione el tipo de envío:</h3>
        <div className="mx-4">
        <form className="flex flex-col gap-4">
        <label className="flex items-center gap-2">
            <input type="radio" name="shippingType" value="store" checked={selectedShipping === "store"} onChange={handleShippingChange}className="form-radio h-3 w-3 text-yellow-600" />
            <span className="text-xs">Instalar en Yantissimo</span>
        </label>
        <label className="flex items-center gap-2">
            <input type="radio" name="shippingType" value="adress" checked={selectedShipping === "adress"} onChange={handleShippingChange} className="form-radio h-3 w-3 text-yellow-600" />
            <span className="text-xs">Envio a domicilio</span>
        </label>
        </form>
        </div> 
    </div>
)
}


