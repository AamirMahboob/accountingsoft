import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig'; // Adjust the import path as needed
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const InvoiceCard = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', crNo: '', pobox: '', bldgAddress: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'add', 'edit', 'delete'

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoader(true);
      const invoiceCollection = collection(db, 'invoices');
      const invoiceSnapshot = await getDocs(invoiceCollection);
      const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invoiceList);
      setLoader(false);
    };

    const fetchCustomers = async () => {
      const customerCollection = collection(db, 'customers');
      const customerSnapshot = await getDocs(customerCollection);
      const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customerList);
    };

    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerDetails({ name: customer.name, crNo: customer.crNo, pobox: customer.pobox, bldgAddress: customer.bldgAddress });
    }
  };

  const handleAddEditInvoice = async () => {
    if (!selectedCustomer || !amount || !date || !proofImage) {
      setError('All fields must be filled out');
      return;
    }

    setLoader(true);
    setError('');

    const storageRef = ref(storage, `proofs/${proofImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, proofImage);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
      },
      (error) => {
        setError('Failed to upload proof image');
        setLoader(false);
      },
      async () => {
        const proofURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newInvoice = { customer: selectedCustomer, amount, date, proofURL, ...customerDetails };

        if (editIndex !== null) {
          const invoiceDoc = doc(db, 'invoices', invoices[editIndex].id);
          await updateDoc(invoiceDoc, newInvoice);
          const updatedInvoices = invoices.map((invoice, index) =>
            index === editIndex ? { ...invoice, ...newInvoice } : invoice
          );
          setInvoices(updatedInvoices);
          setEditIndex(null);
          toast.success('Invoice updated successfully!');
        } else {
          const docRef = await addDoc(collection(db, 'invoices'), newInvoice);
          setInvoices([...invoices, { ...newInvoice, id: docRef.id }]);
          toast.success('Invoice added successfully!');
        }

        setLoader(false);
        setSelectedCustomer('');
        setAmount('');
        setDate('');
        setProofImage(null);
        setCustomerDetails({ name: '', crNo: '', pobox: '', bldgAddress: '' });
        setDialogOpen(false);
      }
    );
  };

  const handleEdit = (index) => {
    const invoice = invoices[index];
    setSelectedCustomer(invoice.customer);
    setAmount(invoice.amount);
    setDate(invoice.date);
    setProofImage();
    setCustomerDetails({ name: invoice.name, crNo: invoice.crNo, pobox: invoice.pobox, bldgAddress: invoice.bldgAddress });
    setEditIndex(index);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const invoiceDoc = doc(db, 'invoices', invoices[index].id);
    await deleteDoc(invoiceDoc);
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    setLoader(false);
    toast.success('Invoice deleted successfully!');
    setDialogOpen(false);
  };

  const handlePrint = (index) => {
    const invoice = invoices[index];
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header, .footer {
              text-align: center;
            }
            .header img {
              height: 50px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th, .table td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            .total {
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice</h1>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div>
              <h2>Customer Details:</h2>
              <p>Customer Name: ${invoice.name}</p>
              <p>CR No: ${invoice.crNo}</p>
              <p>P.O. Box: ${invoice.pobox}</p>
              <p>Building Address: ${invoice.bldgAddress}</p>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (BHD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Amount</td>
                  <td>${invoice.amount}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>Company Information Here</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card>
      <Typography variant="h5" className='m-5'>Invoices</Typography>
      <CardBody>
        <Button className="mb-4" onClick={() => { setDialogType('add'); setDialogOpen(true); }}>Add Invoice</Button>
        {loader ? (
          <Typography><Spinner /></Typography>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Proof</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{invoice.name}</td>
                  <td className="px-6 py-4">{invoice.amount}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4">
                    {invoice.proofURL ? (
                      <img src={invoice.proofURL} alt="proof" width={50} height={50} />
                    ) : (
                      'No proof'
                    )}
                  </td>
                  <td className="px-6 py-4 flex space-x-4">
                    <FaEdit  className='cursor-pointer' onClick={() => handleEdit(index)} />
                    <FaTrash color='red' className='cursor-pointer' onClick={() => { setEditIndex(index); setDialogType('delete'); setDialogOpen(true); }} />
                    <FaPrint className='cursor-pointer' onClick={() => handlePrint(index)} />
                      
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>

      <Dialog open={dialogOpen} handler={() => setDialogOpen(false)}>
        <DialogHeader>
          {dialogType === 'delete' ? 'Delete Invoice' : editIndex !== null ? 'Edit Invoice' : 'Add Invoice'}
        </DialogHeader>
        <DialogBody>
          {dialogType === 'delete' ? (
            <Typography>Are you sure you want to delete this invoice?</Typography>
          ) : (
            <div className="flex flex-col space-y-4">
              <select
                value={selectedCustomer}
                onChange={handleCustomerChange}
                className="border border-gray-300 p-2 rounded"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                label="Name"
                value={customerDetails.name}
                disabled
              />
              <Input
                type="text"
                label="CR No"
                value={customerDetails.crNo}
                disabled
              />
              <Input
                type="text"
                label="P.O. Box"
                value={customerDetails.pobox}
                disabled
              />
              <Input
                type="text"
                label="Building Address"
                value={customerDetails.bldgAddress}
                disabled
              />
              <Input
                type="text"
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                type="file"
                label="Proof Image"
                onChange={(e) => setProofImage(e.target.files[0])}
              />
              {error && <Typography color="red">{error}</Typography>}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {dialogType === 'delete' ? (
            <>
              <Button variant="text" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="filled" color="red" onClick={() => handleDelete(editIndex)}>Delete</Button>
            </>
          ) : (
            <>
              <Button variant="text" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="filled" onClick={handleAddEditInvoice}>
                {editIndex !== null ? 'Edit Invoice' : 'Add Invoice'}
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </Card>
  );
};

export default InvoiceCard;
