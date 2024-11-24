import connectToDB from '@/lib/db';
import User from '@/lib/models/user';
import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';

export const GET = async () => {
  try {
    await connectToDB();
    const users = await User.find();

    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error in fetching users: ' + error.message, {
      status: 500,
    });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    await connectToDB();

    const newUser = new User(body);
    await newUser.save();

    return new NextResponse(
      JSON.stringify({ message: 'User is created', user: newUser }),
      { status: 201 }
    );
  } catch (error: any) {
    return new NextResponse('Error in creating user :' + error.message, {
      status: 500,
    });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, newUserName } = body;

    if (!userId || !newUserName) {
      return new NextResponse(
        JSON.stringify({ message: 'ID or new username not found' }),
        {
          status: 400,
        }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: 'Invalid User Id' }), {
        status: 400,
      });
    }

    await connectToDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: newUserName },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse(
        JSON.stringify({
          message: 'User not found in the database',
          user: updatedUser,
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'User is updated', user: updatedUser }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse('Error in updating user: ' + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'ID not found' }), {
        status: 400,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: 'Invalid user id' }), {
        status: 500,
      });
    }

    await connectToDB();

    const deletedUser = await User.findByIdAndDelete(
      new mongoose.Types.ObjectId(userId)
    );

    if (!deletedUser) {
      return new NextResponse(
        JSON.stringify({
          message: 'User not found in database',
          user: deletedUser,
        }),
        {
          status: 400,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: 'User deleted sucessfully',
        user: deletedUser,
      }),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return new NextResponse('Error in deleting user: ' + error.message, {
      status: 500,
    });
  }
};
