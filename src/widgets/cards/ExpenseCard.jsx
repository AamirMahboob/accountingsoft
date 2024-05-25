// ExpenseCard.jsx
import React, { useState } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option } from '@material-tailwind/react';

const ExpenseCard = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');

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

  const filteredExpenses = expenses.filter((expense) =>
    filterMonth ? new Date(expense.date).getMonth() + 1 === parseInt(filterMonth) : true
  );

  return (
    <Card>
      <CardBody>
        <Typography variant="h5">Expenses</Typography>
        <div className="flex space-x-4 mb-4">
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
          <Button onClick={handleAddEditExpense}>
            {editIndex !== null ? 'Edit Expense' : 'Add Expense'}
          </Button>
        </div>
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
