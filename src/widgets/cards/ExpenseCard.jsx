// ExpenseCard.jsx
import React, { useState } from 'react';
import { Card, CardBody, Typography, Button, Input } from '@material-tailwind/react';

const ExpenseCard = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const handleAddEditExpense = () => {
    const newExpense = { description, date, amount };

    if (editIndex !== null) {
      const updatedExpenses = expenses.map((expense, index) =>
        index === editIndex ? newExpense : expense
      );
      setExpenses(updatedExpenses);
      setEditIndex(null);
    } else {
      setExpenses([...expenses, newExpense]);
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

  const handleDelete = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  return (
    <Card>
      <CardBody>
        <Typography variant="h5">Expenses</Typography>
        <div className="flex space-x-4">
          <Input
            type="text"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button onClick={handleAddEditExpense} className="mt-4">
          {editIndex !== null ? 'Edit Expense' : 'Add Expense'}
        </Button>
        <ul>
          {expenses.map((expense, index) => (
            <li key={index} className="flex justify-between">
              <span>{expense.description}</span>
              <span>{expense.date}</span>
              <span>{expense.amount}</span>
              <Button onClick={() => handleEdit(index)}>Edit</Button>
              <Button onClick={() => handleDelete(index)}>Delete</Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default ExpenseCard;
