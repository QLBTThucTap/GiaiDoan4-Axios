import axios from "axios";
import Instance from "./Instance";
import React from "react";
/*
ReqRes và JSONPlaceholder có cấu trúc response khác nhau.

ReqRes kiểu cũ thường trả:
      {
        page: 1,
        data: [
          ...
        ]
      }
nên có thể dùng: res.data.data

Còn JSONPlaceholder trả thẳng:
      [
        {...},
        {...}
      ]

nên chỉ cần: res.data

*/
class ListUser extends React.Component {
  state = {
    listUsers: [],
  };

  async componentDidMount() {
    let res = await Instance.get("users");

    console.log(">>> check res:", res);
    console.log(">>> check data:", res.data);

    this.setState({
      listUsers: res.data,
    });
  }

  render() {
    let { listUsers } = this.state;

    return (
      <div>
        <h2>Fetch all list users</h2>

        <div>
          {listUsers &&
            listUsers.length > 0 &&
            listUsers.map((item, index) => {
              return (
                <div key={item.id}>
                  {index + 1} - {item.name} - {item.username}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

export default ListUser;
