// Add this type declaration at the top of your file
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}
import { HiOutlineCreditCard, HiOutlineClock, HiOutlineCash } from "react-icons/hi";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from 'react-modal';
import { FiSearch } from "react-icons/fi";

interface Transaction {
  id: string;
  userName: string;
  userId: string;
  totalAmount: number;
  transactionDate: string;
  orders: {
    orderId: string;
    orderDate: string;
    orderTotal: number;
    status: string;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
}
const generateTransactionEmailHTML = (transaction: Transaction) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .header { color: #2d3748; font-size: 24px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background-color: #f7fafc; text-align: left; padding: 12px; }
          .table td { padding: 12px; border: 1px solid #e2e8f0; }
          .total { font-size: 18px; font-weight: bold; color: #2d3748; }
          .status { padding: 6px 12px; border-radius: 4px; font-size: 14px; }
          .completed { background-color: #c6f6d5; color: #22543d; }
          .pending { background-color: #fed7d7; color: #822727; }
        </style>
      </head>
      <body>
        <h1 class="header">Transaction Receipt</h1>
        
        <div class="section">
          <h3>Transaction Details</h3>
          <p><strong>ID:</strong> ${transaction.id}</p>
          <p><strong>Date:</strong> ${new Date(transaction.transactionDate).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${transaction.userName}</p>
          <p><strong>Total Amount:</strong> $${transaction.totalAmount.toFixed(2)}</p>
        </div>

        ${transaction.orders.map((order, index) => `
          <div class="section">
            <h3>Order #${index + 1}</h3>
            <p><strong>Status:</strong> 
              <span class="status ${order.status === 'completed' ? 'completed' : 'pending'}">
                ${order.status}
              </span>
            </p>
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p class="total">Order Total: $${order.orderTotal.toFixed(2)}</p>
          </div>
        `).join('')}
      </body>
    </html>
  `;
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:8084/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTransactionEmail = async (userId: string, htmlContent: string) => {
    try {
      await axios.post('http://localhost:8085/api/notifications/send-transaction', {
        userId,
        htmlContent
      });
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email.');
    }
  };

  const generateReport = () => {
  const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Transaction Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // Table
    const data = transactions.map(t => [
      t.userName,
      `$${t.totalAmount.toFixed(2)}`,
      new Date(t.transactionDate).toLocaleDateString(),
      t.orders.reduce((total, order) => total + order.items.length, 0)
    ]);
    autoTable(doc, {
    head: [['Name', 'Total Amount', 'Date', 'Items']],
    body: data,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [63, 81, 181] }
  });

    doc.save('transactions-report.pdf');
  };

  const generateTransactionPDF = (transaction: Transaction) => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(`Transaction #${transaction.id}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(transaction.transactionDate).toLocaleDateString()}`, 14, 30);
    doc.text(`Customer: ${transaction.userName}`, 14, 35);
    doc.text(`Total Amount: $${transaction.totalAmount.toFixed(2)}`, 14, 40);

    let yPos = 50;
    transaction.orders.forEach((order, index) => {
      doc.setFontSize(12);
      doc.text(`Order #${index + 1} (${order.status})`, 14, yPos);
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Item', 'Quantity', 'Price']],
        body: order.items.map(item => [item.name, item.quantity, `$${item.price.toFixed(2)}`]),
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 50;
    });

    doc.save(`transaction-${transaction.id}.pdf`);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchTransactions();
    Modal.setAppElement('#root');
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
       <Link
  to="/transactions/user"
  className="group bg-green-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-3"
>
  <h3 className="text-gray-500 text-sm ">User Transactions</h3>
  <div className="flex flex-col gap-2">
    <FiSearch className="w-12 h-12 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
   
  </div>
</Link>

<Link
  to="/transactions/restaurant"
  className="group bg-green-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-3"
>
  <h3 className="text-gray-500 text-sm ">Restaurant Transactions</h3>
  <div className="flex flex-col gap-2">
    <FiSearch className="w-12 h-12 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
   
  </div>
</Link>
        {/* <Link
          to="/transactions/restaurant"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-gray-500 text-sm mb-2">Restaurant Transactions</h3>
          <p className="text-3xl font-bold text-green-600">View</p>
        </Link> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div className="bg-indigo-50 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-sm text-indigo-600 mb-1">Total Transactions</p>
      <p className="text-3xl font-bold text-indigo-700">{transactions.length}</p>
    </div>
    <div className="bg-indigo-100 p-3 rounded-lg">
      <HiOutlineCreditCard className="w-8 h-8 text-indigo-600" />
    </div>
  </div>

  <div className="bg-green-50 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-sm text-green-600 mb-1">Today's Transactions</p>
      <p className="text-3xl font-bold text-green-700">
        {transactions.filter(t => 
          new Date(t.transactionDate).toDateString() === new Date().toDateString()
        ).length}
      </p>
    </div>
    <div className="bg-green-100 p-3 rounded-lg">
      <HiOutlineClock className="w-8 h-8 text-green-600" />
    </div>
  </div>

  <div className="bg-purple-50 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-sm text-purple-600 mb-1">Total Amount</p>
      <p className="text-3xl font-bold text-purple-700">
        ${transactions.reduce((sum, t) => sum + t.totalAmount, 0).toFixed(2)}
      </p>
    </div>
    <div className="bg-purple-100 p-3 rounded-lg">
      <HiOutlineCash className="w-8 h-8 text-purple-600" />
    </div>
  </div>
</div>
      <div className="flex justify-between items-center mb-6">
        {/* Search Box */}
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Generate Report Button */}
        <button
          onClick={generateReport}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Items</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4">{transaction.userName}</td>
                <td className="px-6 py-4">${transaction.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {transaction.orders.reduce((total, order) => total + order.items.length, 0)}
                </td>
                <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setModalIsOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View
                  </button>
                  <button
  onClick={() => {
    const htmlContent = generateTransactionEmailHTML(transaction);
    sendTransactionEmail(transaction.userId, htmlContent);
  }}
  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Send
                  </button>
                 </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
     {/* Modal Overlay */}
     {modalIsOpen && (
        <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
              <button
                onClick={() => setModalIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
        {selectedTransaction && (
          
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-gray-800">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedTransaction.transactionDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium text-gray-800">{selectedTransaction.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-800">${selectedTransaction.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {selectedTransaction.orders.map((order, index) => (
                <div key={order.orderId} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">Order #{index + 1}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 text-gray-600">Item</th>
                        <th className="text-left pb-2 text-gray-600">Quantity</th>
                        <th className="text-left pb-2 text-gray-600">Price</th>
                        <th className="text-right pb-2 text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-gray-100">
                          <td className="py-2 text-gray-800">{item.name}</td>
                          <td className="py-2 text-gray-800">{item.quantity}</td>
                          <td className="py-2 text-gray-800">${item.price.toFixed(2)}</td>
                          <td className="py-2 text-right text-gray-800">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setModalIsOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => generateTransactionPDF(selectedTransaction)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
         
        )}
          </div>
        </div>
      )}
    </div>

  );
};

export default TransactionsPage;