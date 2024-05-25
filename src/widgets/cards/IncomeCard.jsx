// IncomeCard.jsx
import React, { useState } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option } from '@material-tailwind/react';

const IncomeCard = () => {
  const [incomes, setIncomes] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');

  const handleAddEditIncome = () => {
    const newIncome = { description, date, amount };

    if (editIndex !== null) {
      const updatedIncomes = incomes.map((income, index) =>
        index === editIndex ? newIncome : income
      );
      setIncomes(updatedIncomes);
      setEditIndex(null);
    } else {
      setIncomes([...incomes, newIncome]);
    }

    setDescription('');
    setDate('');
    setAmount('');
  };

  const handleEdit = (index) => {
    const income = incomes[index];
    setDescription(income.description);
    setDate(income.date);
    setAmount(income.amount);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedIncomes = incomes.filter((_, i) => i !== index);
    setIncomes(updatedIncomes);
  };

  const filteredIncomes = incomes.filter((income) =>
    filterMonth ? new Date(income.date).getMonth() + 1 === parseInt(filterMonth) : true
  );

  return (
    <Card>
      <CardBody>
        <Typography variant="h5">Income</Typography>
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
          <Button onClick={handleAddEditIncome}>
            {editIndex !== null ? 'Edit Income' : 'Add Income'}
          </Button>
        </div>
        <Select label="Filter by Month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <Option value="">All</Option>
          {[...Array(12).keys()].map((month) => (
            <Option key={month + 1} value={month + 1}>
              {new Date(0, month).toLocaleString('en-US', { month: 'long' })}
            </Option>
          ))}
        </Select>
        <ul className="mt-4">
          {filteredIncomes.map((income, index) => (
            <li key={index} className="flex justify-between mb-2">
              <span>{income.description}</span>
              <span>{income.date}</span>
              <span>{income.amount}</span>
              <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
              <Button size="sm" onClick={() => handleDelete(index)}>Delete</Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default IncomeCard;
