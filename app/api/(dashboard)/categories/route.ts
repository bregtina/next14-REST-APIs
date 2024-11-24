import User from '@/lib/models/user';
import Category from '@/lib/models/category';
import { NextResponse, NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectToDB from '@/lib/db';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid id or missing id' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User does not exist' }),
        { status: 400 }
      );
    }

    const categories = await Category.find({
      user: new Types.ObjectId(userId),
    });

    return new NextResponse(JSON.stringify(categories), { status: 200 });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify('Error in fetching category: ' + error.message),
      {
        status: 500,
      }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const { title } = await request.json();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid or missing user id' }),
        { status: 404 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User is not in database' }),
        { status: 404 }
      );
    }

    const newCategory = new Category({
      title,
      user: new Types.ObjectId(userId),
    });

    await newCategory.save();

    return new NextResponse(JSON.stringify(newCategory), { status: 201 });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify('Error creating category: ' + error.message),
      {
        status: 500,
      }
    );
  }
};
