"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define Review interface for type safety
interface Review {
  id: string;
  userEmail: string;
  like: boolean;
  name: string;
  email: string;
  date: string;
  time: string;
  review: string;
}

// Define FeedbackItem interface for type safety
interface FeedbackItem {
  id: string;
  orderId: string;
  userEmail: string;
  positiveFeedback: boolean;
  dateAdded: string;
  timeAdded: string;
  comments: string;
}

const CustomerReviewsPage = () => {
  const [review, setReview] = useState("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get all cookies
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    
    // Check if a cookie named 'user' exists
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));
  
    // Allow access only if the cookie is not 'user' and some other cookie exists
    if (!userCookie && cookies.length === 0) {
      // Redirect to '/' if no cookies exist or if 'user' cookie exists
      router.push('/');
    }
  }, [router]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      const feedbackCollection = collection(db, "customerFeedbacks");
      const usersCollection = collection(db, "users");
    
      // Fetch feedback documents
      const feedbackSnapshot = await getDocs(feedbackCollection);
      const feedbackData = feedbackSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderId: data.orderId, // Ensure this property exists
            userEmail: data.userEmail, // Ensure this property exists
            positiveFeedback: data.positiveFeedback, // Ensure this property exists
            dateAdded: data.dateAdded, // Ensure this property exists
            timeAdded: data.timeAdded, // Ensure this property exists
            comments: data.comments, // Ensure this property exists
          } as FeedbackItem; // Assert as FeedbackItem
        })
        .filter((item) => item.id !== "feedbackRating"); // Filter out 'feedbackRating'
    
      // Fetch user documents and map emails to names
      const userSnapshot = await getDocs(usersCollection);
      const userData = userSnapshot.docs.reduce<{ [key: string]: string }>((acc, doc) => {
        const { email, firstName, lastName } = doc.data();
        acc[email] = `${firstName} ${lastName}`;
        return acc;
      }, {});
    
      // Combine feedback with user data
      const reviewsWithNames = await Promise.all(
        feedbackData.map(async (item: FeedbackItem) => {
          let fullName = userData[item.userEmail] || "Unknown User";
    
          if (fullName === "Unknown User") {
            const userDocRef = doc(db, "users", item.userEmail);
            const userDoc = await getDoc(userDocRef);
    
            if (userDoc.exists()) {
              const userDocData = userDoc.data();
              fullName = `${userDocData.firstName} ${userDocData.lastName}`;
            }
          }
    
          return {
            id: item.orderId,  // Corrected here to match `Review` type
            userEmail: item.userEmail,  // Ensured `userEmail` is included
            like: item.positiveFeedback === true,  // Ensures truthy check
            name: fullName,
            email: item.userEmail,  // Using email from FeedbackItem
            date: item.dateAdded,
            time: item.timeAdded,
            review: item.comments,
          };
        })
      );
    
      // Update state with reviews
      setReviews(reviewsWithNames);
    };

    fetchReviews();
  }, []);

  const handleReviewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReview(event.target.value);
  };

  // Sort reviews by date in descending order
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Correct comparison for dates
  });

  return (
    <div className="w-full mt-14 min-h-[calc(100vh-56px)] px-10 md:px-24 xl:px-56 py-4 flex items-start justify-center">
      <div className="fixed hidden top-0 left-0 h-[100vh] w-full lg:block z-[-1] lg:bg-[url('/backgrounds/bg3-2.png')] lg:bg-cover lg:bg-no-repeat lg:bg-center"></div>
      <div className="w-full max-w-[1200px]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1 justify-start">
            <Link href={"/adminhome"} className="flex items-center space-x-1 font-bold text-orange-950 text-lg sm:text-xl text-left hover:text-orange-800 cursor-pointer md:text-2xl">
              <span>Dashboard</span>
              <i className="fa fa-angle-left mr-[-4px]" aria-hidden="true"></i>
            </Link>
            <h1 className="text-lg sm:text-xl text-orange-950 font-bold md:text-2xl">Reviews</h1>
          </div>
          <select
            className="text-center w-32 font-bold text-gray-500 h-10 border-2 border-gray-100 shadow-md rounded-md"
            onChange={handleReviewChange}
          >
            <option value="all">All</option>
            <option value="like">Like</option>
            <option value="dislike">Dislike</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedReviews.map((rev) => (
            <div
              className={`w-full border-gray-100 border-2 shadow-md rounded-md pt-2 pb-4 px-4 bg-white flex flex-col gap-1 ${
                review === "dislike" && rev.like
                  ? "hidden"
                  : review === "like" && !rev.like
                  ? "hidden"
                  : "visible"
              }`}
              key={rev.id}
            >
              <div className="w-full flex items-center gap-2">
                <i
                  className={`fa fa-thumbs-${rev.like ? "up text-[#60A66F]" : "down text-[#F0565F]"} text-lg`}
                  aria-hidden="true"
                ></i>
                <span className="text-md font-semibold text-gray-900">{rev.name}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>{rev.email} - </span>
                <span>{rev.date} - {rev.time}</span>
              </div>
              <p className="text-gray-700 text-sm italic">{`"${rev.review}"`}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewsPage;
