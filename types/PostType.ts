type PostType = {
    postId: string; // Ensure postId is a string
    username: string;
    postedTime: any;
    type: string;
    title: string;
    body: string;
    numComments: number;
    numReposts: number;
    votes: number;
    hasImage: boolean;
    isUpvoted: boolean;
    isDownvoted: boolean;
};

export default PostType