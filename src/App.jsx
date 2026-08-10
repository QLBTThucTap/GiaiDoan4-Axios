// import React, { useEffect, useState } from "react";
// import { getPost } from "./HTTP/http";

// const App = () => {
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getPost()
//       .then((data) => {
//         if (data) {
//           setPost(data);
//           console.log("Tieu de: ", data.title);
//           console.log("Noi dung: ", data.body);
//         }
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <p>Đang tải...</p>;
//   }

//   return (
//     <div>
//       {post ? (
//         <>
//           <h3>Tiêu đề: {post.title}</h3>
//           <p>Nội dung: {post.body}</p>
//         </>
//       ) : (
//         <p>Không thể tải dữ liệu bài viết.</p>
//       )}
//     </div>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import { demoFullCycle } from "./HTTP/httpMethods";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    demoFullCycle().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Đang chạy demo CRUD... (mở Console để xem log)</p>;
  }

  return (
    <div>
      <p>Đã chạy xong demo GET / POST / PUT / PATCH / DELETE.</p>
      <p>Mở DevTools Console (F12) để xem chi tiết từng request/response.</p>
    </div>
  );
};

export default App;
