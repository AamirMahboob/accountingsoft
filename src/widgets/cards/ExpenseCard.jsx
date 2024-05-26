// ExpenseCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as needed

const ExpenseCard = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      const expenseCollection = collection(db, 'expenses');
      const expenseSnapshot = await getDocs(expenseCollection);
      const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expenseList);
    };

    fetchExpenses();
  }, []);

  const handleAddEditExpense = async () => {
    if (!description || !date || !amount) {
      setError('All fields must be filled out');
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
    const expenseDoc = doc(db, 'expenses', expenses[index].id);
    await deleteDoc(expenseDoc);
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const filteredExpenses = expenses.filter((expense) =>
    filterMonth ? new Date(expense.date).getMonth() + 1 === parseInt(filterMonth) : true
  );

  return (
    <Card>
        <Typography variant="h5">Expenses</Typography>

      <CardBody>
        <div className="flex space-x-4 mb-4">
        <div className='flex flex-col'>
        <Typography variant="h6">Description</Typography>
          
          <Input
            type="text"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
          <div className='flex flex-col'>
          <Typography variant="h6">Date</Typography>
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          </div>
          <div className='flex flex-col'>
            <Typography variant="h6">Amount</Typography>
          <Input
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          </div>
          <Button className='w-32 h-10 mt-6' onClick={handleAddEditExpense}>
            {editIndex !== null ? 'Edit Expense' : 'Add Expense'}
          </Button>
        </div>
        {error && <Typography color="red">{error}</Typography>}
        <div className="mb-4">
          <Select label="Filter by Month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <Option value="">All</Option>
            {[...Array(12).keys()].map((month) => (
              <Option key={month + 1} value={month + 1}>
                {new Date(0, month).toLocaleString('en-US', { month: 'long' })}
              </Option>
            ))}
          </Select>
        </div>
        <ul className="mt-4">
          {filteredExpenses.map((expense, index) => (
            <li key={index} className="flex justify-between mb-2">
              <span>{expense.description}</span>
              <span>{expense.date}</span>
              <span>{expense.amount}</span>
              <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
              <Button size="sm" onClick={() => handleDelete(index)}>Delete</Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default ExpenseCard;
