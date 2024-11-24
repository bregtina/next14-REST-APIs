import connectToDB from '@/lib/db';
import Category from '@/lib/models/category';
import User from '@/lib/models/user';
import { SchemaTypes, Types } from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';

export const PATCH = async (request: NextRequest, context: { params: any }) => {
  try {
    const body = await request.json();
    const { title } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const categoryId = context.params.categoryId;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid or missing user id' }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid or missing category id' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });
    }

    const category = await Category.findOne({ _id: categoryId, user: userId });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found' }),
        {
          status: 404,
        }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { title },
      { new: true }
    );

    return new NextResponse(
      JSON.stringify({
        message: 'Category updated',
        category: updatedCategory,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new NextResponse(JSON.stringify('Error in updating category: '), {
      status: 500,
    });
  }
};

export const DELETE = async (
  request: NextRequest,
  context: { params: any }
) => {
  const categoryId = context.params.categoryId;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({
          message: 'Invalid category id or no category id found',
        }),
        { status: 400 }
      );
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: 'Invalid user id or no user id found',
        }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          message: 'User not found in the database',
        }),
        { status: 400 }
      );
    }

    const category = await Category.findOne({
      _id: categoryId,
      user: userId,
    });

    if (!category) {
      return new NextResponse(
        JSON.stringify({
          message: 'Category not found in the database or belong to the user',
        }),
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(categoryId);

    return new NextResponse(
      JSON.stringify({
        message: 'Category sucessfully deleted',
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify('Error with deleting the category:'),
      { status: 500 }
    );
  }
};
