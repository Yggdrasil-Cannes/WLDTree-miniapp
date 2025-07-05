import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = await request.json();

    if (!userId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return NextResponse.json({ error: 'All payment method fields are required' }, { status: 400 });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In a real application, you would integrate with a payment processor like Stripe
    // For demo purposes, we'll simulate the payment method creation
    
    // Extract last 4 digits and determine card brand
    const last4 = cardNumber.replace(/\s+/g, '').slice(-4);
    const firstDigit = cardNumber.replace(/\s+/g, '')[0];
    
    let brand = 'unknown';
    if (firstDigit === '4') brand = 'visa';
    else if (firstDigit === '5') brand = 'mastercard';
    else if (firstDigit === '3') brand = 'amex';

    // Create a mock payment method record
    const paymentMethod = {
      id: `pm_${Date.now()}`,
      last4,
      brand,
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      isDefault: true // First payment method is default
    };

    // In production, you would save payment method details to your database
    // For now, we'll just return the mock payment method
    
    return NextResponse.json({
      success: true,
      paymentMethod,
      message: 'Payment method added successfully'
    });

  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 