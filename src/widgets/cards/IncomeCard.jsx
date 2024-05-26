// IncomeCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as needed

const IncomeCard = () => {
  const [incomes, setIncomes] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIncomes = async () => {
      const incomeCollection = collection(db, 'incomes');
      const incomeSnapshot = await getDocs(incomeCollection);
      const incomeList = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncomes(incomeList);
    };

    fetchIncomes();
  }, []);

  const handleAddEditIncome = async () => {
    if (!description || !date || !amount) {
      setError('All fields must be filled out');
      return;
    }

    const newIncome = { description, date, amount };
    setError('');

    if (editIndex !== null) {
      const incomeDoc = doc(db, 'incomes', incomes[editIndex].id);
      await updateDoc(incomeDoc, newIncome);
      const updatedIncomes = incomes.map((income, index) =>
        index === editIndex ? { ...income, ...newIncome } : income
      );
      setIncomes(updatedIncomes);
      setEditIndex(null);
    } else {
      const docRef = await addDoc(collection(db, 'incomes'), newIncome);
      setIncomes([...incomes, { ...newIncome, id: docRef.id }]);
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

  const handleDelete = async (index) => {
    const incomeDoc = doc(db, 'incomes', incomes[index].id);
    await deleteDoc(incomeDoc);
    const updatedIncomes = incomes.filter((_, i) => i !== index);
    setIncomes(updatedIncomes);
  };

  const filteredIncomes = incomes.filter((income) =>
    filterMonth ? new Date(income.date).getMonth() + 1 === parseInt(filterMonth) : true
  );

  return (
    <Card>
        <Typography variant="h5">Income</Typography>
      <CardBody>
      
        <div className="flex  space-x-4 mb-4">
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
          
          <Button className='w-32 h-10 mt-6'  onClick={handleAddEditIncome}>
            {editIndex !== null ? 'Edit Income' : 'Add Income'}
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
