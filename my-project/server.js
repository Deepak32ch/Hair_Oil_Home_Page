const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Use promises for better error handling
const path = require('path');
const ExcelJS = require('exceljs');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static('public'));

// Paths to main and demo Excel files
const mainExcelFilePath = path.join(__dirname, 'orders.xlsx'); // Main file
const demoExcelFilePath = path.join(__dirname, 'order2.xlsx'); // Demo file

// Helper function to handle the Excel write operation
async function writeToExcel(excelFilePath, productName, quantity, customerName, address, phone) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const worksheet = workbook.getWorksheet(1);

    // Append new row with data
    const newRow = worksheet.addRow([productName, quantity, customerName, address, phone]);
    newRow.commit();

    // Save the updated Excel file
    await workbook.xlsx.writeFile(excelFilePath);
}

// API endpoint to handle order submission
app.post('/submit-order', async (req, res) => {
    const { productName, quantity, customerName, address, phone } = req.body;

    try {
        // Check if the main file is accessible
        try {
            await fs.access(mainExcelFilePath); // Check if the file is accessible
            console.log('Main Excel sheet is accessible, attempting to write...');

            await writeToExcel(mainExcelFilePath, productName, quantity, customerName, address, phone);
            console.log('Order written to main Excel sheet.');

        } catch (mainError) {
            console.error('Main Excel sheet is locked or not accessible, switching to demo file.', mainError);
            
            // Fallback to demo sheet
            await writeToExcel(demoExcelFilePath, productName, quantity, `NEW ${customerName}`, address, phone);
            console.log('Order written to demo Excel sheet.');
        }

        // Emit the order event to connected clients for real-time update
        io.emit('newOrder', req.body);

        // Send a success response back to the client
        res.status(200).json({ message: 'Order submitted successfully and Excel updated.' });

    } catch (error) {
        console.error('Error updating Excel:', error);
        res.status(500).json({ message: 'Failed to submit order.' });
    }
});

// Serve the front-end
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
