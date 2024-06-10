import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig'; // Adjust the import path as needed
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { LuListPlus } from "react-icons/lu";
import { MdDelete } from "react-icons/md";

const InvoiceCard = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceEntries, setInvoiceEntries] = useState([{ description: '', date: '', qty: '', amount: '', total: 0 }]);
  const [proofImage, setProofImage] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', crNo: '', pobox: '', bldgAddress: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [valueAddedTax, setValueAddedTax] = useState(0);
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
    console.log("Selected Customer:", selectedCustomer);
    console.log("Invoice Entries:", invoiceEntries);
    console.log("Proof Image:", proofImage);
    console.log("Value Added Tax:", valueAddedTax);

    if (!selectedCustomer || invoiceEntries.some(entry => !entry.description || !entry.date || !entry.qty || !entry.amount) || !proofImage) {
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
        const grandTotal = invoiceEntries.reduce((acc, entry) => acc + entry.total, 0) + parseFloat(valueAddedTax);
        const newInvoice = { customer: selectedCustomer, entries: invoiceEntries, proofURL, valueAddedTax, grandTotal, ...customerDetails };

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
        setInvoiceEntries([{ description: '', date: '', qty: '', amount: '', total: 0 }]);
        setProofImage(null);
        setCustomerDetails({ name: '', crNo: '', pobox: '', bldgAddress: '' });
        setValueAddedTax(0);
        setDialogOpen(false);
      }
    );
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = invoiceEntries.map((entry, i) => {
      const updatedEntry = i === index ? { ...entry, [field]: value } : entry;
      if (field === 'qty' || field === 'amount') {
        updatedEntry.total = parseFloat(updatedEntry.qty) * parseFloat(updatedEntry.amount) || 0;
      }
      return updatedEntry;
    });
    setInvoiceEntries(updatedEntries);
  };

  const addEntry = () => {
    setInvoiceEntries([...invoiceEntries, { description: '', date: '', qty: '', amount: '', total: 0 }]);
  };

  const removeEntry = (index) => {
    setInvoiceEntries(invoiceEntries.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const invoice = invoices[index];
    setSelectedCustomer(invoice.customer);
    setInvoiceEntries(invoice.entries || []);
    setProofImage(null);
    setCustomerDetails({ name: invoice.name, crNo: invoice.crNo, pobox: invoice.pobox, bldgAddress: invoice.bldgAddress });
    setValueAddedTax(invoice.valueAddedTax || 0);
    setEditIndex(index);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    setLoader(true);
    const invoiceDoc = doc(db, 'invoices', invoices[editIndex].id);
    await deleteDoc(invoiceDoc);
    const updatedInvoices = invoices.filter((_, i) => i !== editIndex);
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
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="font-sans p-5">
          <div class="flex justify-center items-center">
            <h2 class="text-2xl font-bold">NDT Global W.L.L</h2>
            <hr style="width:100%;text-align:left;margin-left:0">
          </div>
          <div class="flex justify-center items-center">
            <h2 class="text-2xl font-bold text-center">Tax Invoice</h2>
          </div>
          <h1 class="text-3xl font-bold mb-5">Tax Invoice</h1>
          <div class="invoice-details mb-5">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Invoice #: ${invoice.crNo || 'N/A'}</p>
          </div>
          <div class="customer-details mb-5">
            <h3 class="text-xl font-semibold">To:</h3>
            <p>${invoice.name}</p>
            <p>CR No: ${invoice.crNo}</p>
            <p>P.O. Box: ${invoice.pobox}</p>
            <p>Building Address: ${invoice.bldgAddress}</p>
          </div>
          <table class="w-full border-collapse border border-gray-400">
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-400 px-4 py-2">Description</th>
                <th class="border border-gray-400 px-4 py-2">Date</th>
                <th class="border border-gray-400 px-4 py-2">Quantity</th>
                <th class="border border-gray-400 px-4 py-2">Amount (BHD)</th>
                <th class="border border-gray-400 px-4 py-2">Total (BHD)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.entries.map(entry => `
                <tr>
                  <td class="border border-gray-400 px-4 py-2">${entry.description}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.date}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.qty}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.amount}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="value-added-tax mt-5">
            <p>Value Added Tax (VAT): ${invoice.valueAddedTax} BHD</p>
            <p class="font-bold">Grand Total: ${invoice.grandTotal} BHD</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="invoice-card-container">
      <Card className="mb-5">
        <CardBody>
          <Typography variant="h5" className="mb-4">Invoices</Typography>
          <div className="overflow-x-auto">
            {loader ? (
              <div className="flex justify-center items-center">
                <Spinner className="h-12 w-12" />
              </div>
            ) : (
              <table className="w-full border-collapse border border-gray-400">
  <thead>
    <tr className="bg-gray-200">
      <th className="border border-gray-400 px-4 py-2">Customer</th>
      <th className="border border-gray-400 px-4 py-2">Description</th>
      <th className="border border-gray-400 px-4 py-2">Quantity x Amount = Total (BHD)</th>
      <th className="border border-gray-400 px-4 py-2">VAT (BHD)</th>
      <th className="border border-gray-400 px-4 py-2">Grand Total (BHD)</th>
      <th className="border border-gray-400 px-4 py-2">Proof</th>
      <th className="border border-gray-400 px-4 py-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {invoices.map((invoice, index) => (
      <tr key={invoice.id} className="hover:bg-gray-100">
        <td className="border border-gray-400 px-4 py-2">{invoice.name}</td>
        <td className="border border-gray-400 px-4 py-2">
          {invoice.entries.map((entry, i) => (
            <div key={i} className="mb-2">
              <p className="font-semibold">{entry.description}</p>
            </div>
          ))}
        </td>
        <td className="border border-gray-400 px-4 py-2">
          {invoice.entries.map((entry, i) => (
            <div key={i} className="mb-2">
              <p>{entry.qty} x {entry.amount} = {entry.total}</p>
            </div>
          ))}
        </td>
        <td className="border border-gray-400 px-4 py-2">{invoice.valueAddedTax}</td>
        <td className="border border-gray-400 px-4 py-2">{invoice.grandTotal}</td>
        <td className="border border-gray-400 px-4 py-2">
          {invoice.proofURL && (
            <img src={invoice.proofURL} alt="Proof" className="w-20 h-20 object-cover border border-gray-300 rounded" />
          )}
        </td>
        <td className="border border-gray-400 px-4 py-2">
          <div className="flex space-x-2">
            <button onClick={() => handleEdit(index)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
            <button onClick={() => handlePrint(index)} className="text-green-500 hover:text-green-700"><FaPrint /></button>
            <button onClick={() => { setDialogType('delete'); setEditIndex(index); setDialogOpen(true); }} className="text-red-500 hover:text-red-700"><FaTrash /></button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            )}
          </div>
          <Button className="mt-4" onClick={() => { setDialogType('add'); setDialogOpen(true); }}>Add Invoice</Button>
        </CardBody>
      </Card>

      <Dialog open={dialogOpen} handler={() => setDialogOpen(!dialogOpen)}>
      <DialogHeader>
        {dialogType === 'delete' ? 'Confirm Deletion' : (dialogType === 'edit' ? 'Edit Invoice' : 'Add Invoice')}
      </DialogHeader>
      <DialogBody divider className='max-h-[70vh] overflow-y-auto'>
        {dialogType === 'delete' ? (
          <p className="text-center text-red-500">Are you sure you want to delete this invoice?</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-white">Customer</label>
              <select value={selectedCustomer} onChange={handleCustomerChange} className="w-full p-2 border rounded text-black">
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            {invoiceEntries.map((entry, index) => (
              <div key={index} className="mb-4 flex flex-col gap-2">
                <div className='flex gap-2'>
                  <Input
                    type="text"
                    label="Description"
                    value={entry.description}
                    onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                    required
                    className="p-2 border rounded text-black"
                  />
                  <Input
                    type="date"
                    label="Date"
                    value={entry.date}
                    onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                    required
                    className="p-2 border rounded text-black"
                  />
                </div>
                <div className='flex gap-2'>
                  <Input
                    type="number"
                    label="Quantity"
                    value={entry.qty}
                    onChange={(e) => handleEntryChange(index, 'qty', e.target.value)}
                    required
                    className="p-2 border rounded text-black"
                  />
                  <Input
                    type="number"
                    label="Amount"
                    value={entry.amount}
                    onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                    required
                    className="p-2 border rounded text-black"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Total"
                    value={entry.total}
                    readOnly
                    className="p-2 border rounded text-black"
                  />
                  <div className='flex gap-3'>
                  <Button className="bg-white text-white mt-2 py-2 px-4 rounded" onClick={() => removeEntry(index)}>
                  <MdDelete size={24} color='red'  />
                  </Button>
                  <Button className="bg-white  text-white py-2 px-4 rounded" onClick={addEntry}>
              <LuListPlus size={24} color='green' />
            </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <label className="block text-white">Proof Image</label>
              <input type="file" onChange={(e) => setProofImage(e.target.files[0])} required className="block w-full text-white" />
            </div>
            <div className="mt-4">
              <Input
                type="number"
                label="Value Added Tax (BHD)"
                value={valueAddedTax}
                onChange={(e) => setValueAddedTax(e.target.value)}
                required
                className="p-2 border rounded text-black"
              />
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button className="bg-red-500 mr-5 text-white py-2 px-4 rounded" onClick={() => setDialogOpen(false)}>Cancel</Button>
        {dialogType === 'delete' ? (
          <Button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleDelete}>
            Confirm
          </Button>
        ) : (
          <Button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleAddEditInvoice}>
           {loader ? <Spinner /> : (editIndex !== null ? 'Update' : 'Add')}
          </Button>
        )}
      </DialogFooter>
    </Dialog>

    </div>
  );
};

export default InvoiceCard;
