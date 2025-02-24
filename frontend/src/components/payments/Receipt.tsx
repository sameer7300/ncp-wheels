import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCrown, FaDownload, FaPrint } from 'react-icons/fa';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Container = styled.div`
  max-width: 800px;
  margin: 48px auto;
  padding: 24px;
`;

const ReceiptCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  color: white;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    font-size: 24px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  h2 {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  
  p {
    font-size: 18px;
  }
`;

const Details = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 0;
  margin-bottom: 24px;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .value {
    font-weight: 500;
  }
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  justify-content: center;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
  }
`;

interface ReceiptProps {
  payment: {
    id: string;
    listingId: string;
    listingTitle: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
    packageTier: string;
    duration: number;
    user: {
      name: string;
      email: string;
    };
  };
}

export const Receipt: React.FC<ReceiptProps> = ({ payment }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#1a1a1a'
      });
      
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'px'
      });

      const imgData = canvas.toDataURL('image/png');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`receipt-${payment.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      <ReceiptCard ref={receiptRef}>
        <Header>
          <h1><FaCrown /> Payment Receipt</h1>
          <p>Receipt #{payment.id}</p>
        </Header>

        <Grid>
          <Section>
            <h2>From</h2>
            <p>NCP Wheels</p>
            <p>support@ncpwheels.com</p>
          </Section>
          
          <Section>
            <h2>To</h2>
            <p>{payment.user.name}</p>
            <p>{payment.user.email}</p>
          </Section>
        </Grid>

        <Details>
          <Item>
            <span className="label">Listing</span>
            <span className="value">{payment.listingTitle}</span>
          </Item>
          <Item>
            <span className="label">Package</span>
            <span className="value">{payment.packageTier} ({payment.duration} days)</span>
          </Item>
          <Item>
            <span className="label">Payment Method</span>
            <span className="value">{payment.paymentMethod}</span>
          </Item>
          <Item>
            <span className="label">Date</span>
            <span className="value">{format(new Date(payment.createdAt), 'PPP')}</span>
          </Item>
        </Details>

        <Total>
          <span>Total Amount</span>
          <span>PKR {payment.amount}</span>
        </Total>
      </ReceiptCard>

      <Actions>
        <Button
          onClick={handleDownload}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaDownload /> Download PDF
        </Button>
        <Button
          onClick={handlePrint}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaPrint /> Print Receipt
        </Button>
      </Actions>
    </Container>
  );
};
