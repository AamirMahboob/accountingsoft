import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option, Spinner } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as needed
import { MdDeleteOutline } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";

const ExpenseCard = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoader(true);
      const expenseCollection = collection(db, 'expenses');
      const expenseSnapshot = await getDocs(expenseCollection);
      const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expenseList);
      setLoader(false);
    };

    fetchExpenses();
  }, []);

  const handleAddEditExpense = async () => {
    setLoader(true);
    if (!description || !date || !amount) {
      setError('All fields must be filled out');
      setLoader(false);
      return;
    }

    const newExpense = { description, date, amount };
    setError('');

    if (editIndex !== null) {
      const expenseDoc = doc(db, 'expenses', expenses[editIndex].id);
      await updateDoc(expenseDoc, newExpense);
      const updatedExpenses = expenses.map((expense, index) =>
        index === editIndex ? { ...expense, ...newExpense } : expense
      );
      setExpenses(updatedExpenses);
      setEditIndex(null);
    } else {
      const docRef = await addDoc(collection(db, 'expenses'), newExpense);
      setExpenses([...expenses, { ...newExpense, id: docRef.id }]);
    }
    setLoader(false);
    setDescription('');
    setDate('');
    setAmount('');
  };

  const handleEdit = (index) => {
    const expense = expenses[index];
    setDescription(expense.description);
    setDate(expense.date);
    setAmount(expense.amount);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const expenseDoc = doc(db, 'expenses', expenses[index].id);
    await deleteDoc(expenseDoc);
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
    setLoader(false);
  };

  const handleFilterChange = (e) => {
    setFilterMonth(e);
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (!filterMonth) return true;
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() + 1 === parseInt(filterMonth);
  });
  const calculateTotalAmount = () => {
    return filteredExpenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
  };

  return (
    <Card className='flex flex-col gap-4 bg-[#F6F7F8] '>
      <CardBody className='border border-black rounded-md bg-white'>
        <Typography variant="h5">Expenses</Typography>
        <div className="flex space-x-4 mb-4 mt-5">
          <div className="flex flex-col">
            <Typography variant="h6">Description</Typography>
            <Input
              type="text"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Date</Typography>
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Amount</Typography>
            <Input
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button className="w-32 h-10 mt-6" onClick={handleAddEditExpense}>
            {editIndex !== null ? 'Edit Expense' : 'Add Expense'}
          </Button>
        </div>
        {error && <Typography color="red">{error}</Typography>}
        
      </CardBody>
    <CardBody className='border border-black rounded-md bg-white'>
    <Typography variant="h6">Expense Table</Typography>
    <div className='flex justify-between '>
    <div className="mb-4 w-10 mt-4">
          <Select label="Filter by Month" value={filterMonth} onChange={(e) => handleFilterChange(e)}>
            <Option value="">All</Option>
            {[...Array(12).keys()].map((month) => (
              <Option key={month + 1} value={month + 1}>
                {new Date(0, month).toLocaleString('en-US', { month: 'long' })}
              </Option>
            ))}
          </Select>
        </div>
        <Typography variant='h6' className='mr-10'>Total Amount:${calculateTotalAmount()}</Typography>
    </div>
    {loader ? (
        <div className="flex justify-center items-center py-4 ">
          <Typography variant="h6"><Spinner /></Typography>

        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{expense.description}</td>
                  <td className="px-6 py-4">{expense.date}</td>
                  <td className="px-6 py-4">{expense.amount}</td>
                  <td className="px-6 ">
                    <Button size="sm" className='mr-5 ' onClick={() => handleEdit(index)}><MdModeEdit size={20}/></Button>
                    <Button size="sm" className='bg-red-500' onClick={() => handleDelete(index)}><MdDeleteOutline size={20} /></Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </CardBody>
    </Card>
  );
};

export default ExpenseCard;
