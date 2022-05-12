
const Pagination = ({ items, pageSize, onPageChange }) => { // object destructuring
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => { // for loop alternative
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) { // pageSize marks the number of items per page
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("MIT");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "./data.json",
    {
      hits: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {page.map(item => 
            <li key={item.quotes}>{item.quotes[0]}<p key={item.name}>{item.name}</p></li>
          )}
        </ul>
      )}
      <Pagination
        items={data.hits} // data we've retrieved
        pageSize={pageSize} // how many items per page 
        onPageChange={handlePageChange} // changing page
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
