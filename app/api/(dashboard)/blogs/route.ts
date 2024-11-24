import connectToDB from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import User from '@/lib/models/user';
import Category from '@/lib/models/category';
import Blog from '@/lib/models/blog';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');

    const searchKeywords = searchParams.get('keywords') as string;
    const startDate = searchParams.get('startDate') as string;
    const endDate = searchParams.get('endDate') as string;
    const sortOrder = searchParams.get('sortOrder') as string;
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');

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

    const category = await Category.findById(categoryId);

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found in DB' }),
        {
          status: 404,
        }
      );
    }

    // all blogs from a user and a category
    const filter: any = {
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    };

    // all blogs searched with keyword in title and description
    if (searchKeywords) {
      filter.$or = [
        { title: { $regex: searchKeywords, $options: 'i' } },
        { description: { $regex: searchKeywords, $options: 'i' } },
      ];
    }

    // blogs sorted by date range
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.createdAt = {
        $lte: new Date(endDate),
      };
    } else {
      return;
    }

    const skip = (page - 1) * limit;
    // pagination

    const blogs = await Blog.find(filter)
      .sort({
        createdAt: sortOrder === 'asc' ? 'asc' : 'desc',
      })
      .skip(skip)
      .limit(limit);

    return new NextResponse(JSON.stringify({ blogs }), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error in fetching blogs: ' + error.message, {
      status: 500,
    });
  }
};

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');

    const body = await request.json();
    const { title, description } = body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'User id invalid or missing' }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Category id invalid or missing' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), {
        status: 400,
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found' }),
        {
          status: 400,
        }
      );
    }

    const newBlog = await new Blog({
      title,
      description,
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    });

    await newBlog.save();

    return new NextResponse(
      JSON.stringify({ message: 'Blog successfully created', blog: newBlog }),
      { status: 201 }
    );
  } catch (error: any) {
    return new NextResponse('Error is creating blog: ' + error.message, {
      status: 500,
    });
  }
};
