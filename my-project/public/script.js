<!-- Add this to the end of your index.html, before the closing </body> tag -->
<script src="/socket.io/socket.io.js"></script>
<script>
    // Establish WebSocket connection with the server
    const socket = io();

    // Listen for real-time 'newOrder' events
    socket.on('newOrder', (order) => {
        alert('New Order Received:\n' + 
              `Product: ${order.productName}\n` + 
              `Quantity: ${order.quantity}\n` + 
              `Customer: ${order.customerName}\n` + 
              `Address: ${order.address}\n` + 
              `Phone: ${order.phone}`);
        
        // You can update the DOM or add the order to a table here
        const orderList = document.getElementById('order-list');
        const newOrderItem = document.createElement('li');
        newOrderItem.textContent = `Product: ${order.productName}, Quantity: ${order.quantity}, Customer: ${order.customerName}, Address: ${order.address}, Phone: ${order.phone}`;
        orderList.appendChild(newOrderItem);
    });
</script>
