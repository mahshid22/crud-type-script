import React, { useState, useRef, FunctionComponent } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import axios from 'axios'
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

// components
import { ColumnApi, GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import Button from 'react-bootstrap/esm/Button';
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import InputGroup from 'react-bootstrap/esm/InputGroup';
import FormControl from 'react-bootstrap/esm/FormControl';
import Modal from 'react-bootstrap/esm/Modal';

// define interfaces
export interface Row {
  title: string,
  author: string,
  studentNumber: string,
}

export type RowData = Row[];

// If you check my code, I'd be happy to give me feedback.
const App: FunctionComponent = (): React.ReactElement => {
  const defaultValues: Row = {
    title: '',
    author: '',
    studentNumber: '',
  }
  const gridRef = useRef(null);
  const [smShow, setSmShow] = useState<Boolean>(false);
  const [modalMsg, setModalMsg] = useState<string>('');
  const [showForm, setShowForm] = useState<Boolean>(false);
  const [submitBtnTxt, setSubmitBtnTxt] = useState<string>('ثبت');
  const [gridApi, setGridApi] = useState<GridApi>();
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi>();
  const [rowData, setRowData] = useState<RowData>([]);
  const { register, handleSubmit, setValue, control, reset } = useForm<Row>({ defaultValues });

  // define columns default and grid func
  const columnDefs = [
    { headerName: "ردیف", field: "id", },
    { headerName: "عنوان", field: "title", },
    { headerName: "مدرس", field: "author", sortable: false },
    { headerName: "تعداد دانش آموز", field: "studentNumber", sortable: false },
  ]

  // Get AG-Grid API and get DATA
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    getRows()
  };

  const onFirstDataRendered = (params: GridReadyEvent) => {
    // gridColumnApi.autoSizeAllColumns();
    params.api.sizeColumnsToFit();
  };

  // *************** CRUD OPERATIONS*************
  // get rows (GET)
  const getRows = () => {
    axios.get('http://localhost:3001/posts')
      .then(function (response) {
        setRowData(response.data)
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  // show form / reset inputs /
  const handleAddNewRow: React.MouseEventHandler<HTMLButtonElement> = (): void => {
    if (gridApi !== undefined) gridApi.deselectAll()
    setSubmitBtnTxt('ثبت')
    setShowForm(!showForm)
    reset(defaultValues)
  }

  // handle submit form ( POST and PUT)
  const onSubmit: SubmitHandler<Row> = (data: Row) => {
    console.log(data);
    if (gridApi !== undefined) {
      let nodes: RowNode[] = gridApi.getSelectedNodes()
      if (!nodes[0]) {
        axios.post('http://localhost:3001/posts', {
          ...data,
        })
          .then(function (response) {
            setShowForm(!showForm)
            reset(defaultValues)
            getRows()
            setModalMsg('سطر جدید اضافه شد')
            setSmShow(true)
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        const node: RowNode = nodes[0]
        axios.put(`http://localhost:3001/posts/${node.data.id}`, data)
          .then(function (response) {
            // setShowForm(f)
            console.log(response);
            setShowForm(!showForm)
            reset(defaultValues)
            getRows()
            setModalMsg('سطر ویرایش شد')
            setSubmitBtnTxt('ثبت')
            setSmShow(true)
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
  }

  // edit row
  const handleEditNewRow: React.MouseEventHandler<HTMLButtonElement> = (): void => {
    if (gridApi !== undefined) {
      let nodes: RowNode[] = gridApi.getSelectedNodes()
      if (nodes[0]) {
        const node: RowNode = nodes[0]
        setShowForm(true)
        setSubmitBtnTxt('ویرایش')
        setValue('studentNumber', node.data.studentNumber)
        setValue('author', node.data.author)
        setValue('title', node.data.title)
      } else {
        setModalMsg('لطفا یک سطر انتخاب کنید')
        setSmShow(true)
        setShowForm(false)
        setSubmitBtnTxt('ثبت')
      }
    }
  }

  // delete row (DELETE)
  const handleDeleteNewRow: React.MouseEventHandler<HTMLButtonElement> = (): void => {
    if (gridApi !== undefined) {
      let nodes: RowNode[] = gridApi.getSelectedNodes()
      if (nodes[0]) {
        const node: RowNode = nodes[0]
        axios.delete(`http://localhost:3001/posts/${node.data.id}`,)
          .then(response => {
            reset(defaultValues)
            getRows()
            setShowForm(false)
            setModalMsg('سطر با موفقیت حذف شد')
            setSmShow(true)
          })
          .catch(error => console.error('On change student error', error))
      } else {
        setModalMsg('لطفا یک سطر انتخاب کنید')
        setSmShow(true)
      }
    }
  }

  const rowStyle = { background: '#fff' };
  return (
    <div className="container">
      <div className="card ">
        {/* Button Group */}
        <div className="card-body d-flex flex-row-reverse">
          <Button onClick={handleAddNewRow} className="mx-2" variant="success">سطر جدید</Button> {' '}
          <Button onClick={handleEditNewRow} className="mx-2" variant="warning">ویرایش</Button> {' '}
          <Button onClick={handleDeleteNewRow} className="mx-2" variant="danger">حذف</Button> {' '}
        </div>
      </div>
      {/* Form */}
      {showForm && <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-row-reverse typeScriptForm">
        <Controller
          name="title"
          control={control}
          defaultValue=""
          render={({ field }) => <InputGroup className="mb-1">
            <FormControl {...field}
              placeholder="عنوان"
            />
          </InputGroup>}
        />
        <Controller
          name="author"
          control={control}
          defaultValue=""
          render={({ field }) => <InputGroup className="mb-1">
            <FormControl {...field}
              placeholder="مدرس"
            />
          </InputGroup>}
        />
        <Controller
          name="studentNumber"
          control={control}
          defaultValue=""
          render={({ field }) => <InputGroup className="mb-1">
            <FormControl {...field}
              placeholder="تعداد دانشجو"
            />
          </InputGroup>}
        />
        <Button type="submit" variant="primary" className="mx-1">{submitBtnTxt}</Button>
      </form>}
      {/* Grid Table */}
      <div className="ag-theme-alpine " style={{ height: '90vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          ref={gridRef}
          rowSelection="single"
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          rowStyle={rowStyle}
          enableRtl={true}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            filter: true,
            sortable: true,
            floatingFilter: true,
          }}
        >
          {columnDefs.map((col) => {
            if (col.field === 'id') return <AgGridColumn minWidth={50} cellRenderer={() => ''}
              maxWidth={100} checkboxSelection={true} field={col.field} headerName={col.headerName}
              filter='false'
            />
            return <AgGridColumn field={col.field} headerName={col.headerName} resizable={true}
              filter="agTextColumnFilter"
            />
          })}
        </AgGridReact>
      </div>
      {/* Modal MSG */}
      <Modal
        size="sm"
        show={smShow}
        onHide={() => setSmShow(false)}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>{modalMsg}</Modal.Body>
      </Modal>
    </div>
  );
};

export default App;
