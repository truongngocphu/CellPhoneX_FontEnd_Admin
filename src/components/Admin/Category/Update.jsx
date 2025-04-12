import { Col, Divider, Form, Input, message, Modal, notification, Row, Upload } from "antd";
import { useEffect, useState } from "react";
import { updateTheLoai } from "../../../services/loaiSPAPI";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { deleteImg, uploadImg } from "../../../services/uploadAPI";
import './style.scss'
import { v4 as uuidv4 } from 'uuid';
import { extractDriveFileId, extractDriveThumbnailIdAndSz } from "../../../utils/constant";

const Update = (props) => {

    const {
        dataUpdateTheLoai, setDataUpdateTheLoai, fetchListTL, openUpdateTL, setOpenUpdateTL
    } = props

    const [form] = Form.useForm()
    const [isSubmit, setIsSubmit] = useState(false);

    const [imageUrl, setImageUrl] = useState('');    
    const [imageUrlAnh, setImageUrlAnh] = useState('');    
    const [loading, setLoading] = useState(false);
    // hiển thị hình ảnh dạng modal khi upload muốn xem lại
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleAnh, setIsModalVisibleAnh] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [fileListAnh, setFileListAnh] = useState([]);

    useEffect(() => {
        if (openUpdateTL && dataUpdateTheLoai?._id) {                   
            // Tạo danh sách file cho Upload
            if (dataUpdateTheLoai.Icon) {    
                setFileList([
                    {
                        uid: uuidv4(),
                        name: dataUpdateTheLoai.Icon, // Tên file
                        status: 'done', // Trạng thái
                        url: `${dataUpdateTheLoai?.Icon}`, // Đường dẫn đến hình ảnh
                    },
                ]);
            }
            if (dataUpdateTheLoai.Image) {    
                setFileListAnh([
                    {
                        uid: uuidv4(),
                        name: dataUpdateTheLoai.Image, // Tên file
                        status: 'done', // Trạng thái
                        url: `${dataUpdateTheLoai?.Image}`, // Đường dẫn đến hình ảnh
                    },
                ]);
            }

            const init = {
                _id: dataUpdateTheLoai._id,
                TenLoaiSP: dataUpdateTheLoai.TenLoaiSP,  
                Icon: { fileList: fileList },              
                Image: { fileList: fileListAnh },              
                // Icon: dataUpdateTheLoai.Icon,                      
                // Image: dataUpdateTheLoai.Image,                      
            }
            console.log("init: ", init);
            setImageUrl({
                url: dataUpdateTheLoai?.Icon,
                public_id: "", // hoặc null nếu không có
            });        
            setImageUrlAnh({
                url: dataUpdateTheLoai?.Image,
                public_id: "", // hoặc null nếu không có
            }); 
            form.setFieldsValue(init);            
        }
        return () => {
            form.resetFields();
        }
    },[dataUpdateTheLoai, openUpdateTL])

    const handleCancel = () => {
        setOpenUpdateTL(false);
        setImageUrl('')
        setImageUrlAnh('')
        setFileList([]);
        setFileListAnh([]);
        form.resetFields()
    };

    const handleUpdateTL = async (values) => {

        const { _id, TenLoaiSP, Icon} = values

        //     console.log("mota: ", mota);
            
        if (!imageUrl) {
            notification.error({
                message: 'Lỗi validate',
                description: 'Vui lòng upload Icon'
            })
            return;
        }
        if (!imageUrlAnh) {
            notification.error({
                message: 'Lỗi validate',
                description: 'Vui lòng upload hình ảnh'
            })
            return;
        }
       
        setIsSubmit(true)
        const res = await updateTheLoai( _id, TenLoaiSP, imageUrl.url, imageUrlAnh.url)

        if(res){
            message.success(res.message);
            handleCancel()
            setImageUrl('')
            setImageUrlAnh('')
            await fetchListTL()
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            })
        }        
        setIsSubmit(false)
    }

    const handleUploadFileImage = async ({ file, onSuccess, onError }) => {
        try {
            const res = await uploadImg(file);
        
            if (!res || !res.data || !res.data.url) {
                throw new Error("Không có url trong phản hồi từ server.");
            }
        
            const { url, type, public_id } = res.data;
        
            // Gán lại cho Ant Design Upload hiển thị ảnh preview
            file.url = url;
            file.public_id = public_id; // 👈 Gắn vào file để có thể xóa

            // setImageUrl(url);
            setImageUrl({ url, public_id });

            // ✅ Cập nhật fileList cho Upload để hiển thị ảnh mới
            setFileList([
                {
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    url: url,
                    public_id: public_id,
                },
            ]);
        
            onSuccess({
                url,
                public_id, // 👈 thêm dòng này để Upload giữ lại
                type,
            });
        } catch (error) {
            console.error("Lỗi upload:", error);
            onError(error);
        }
    };
    const handleUploadFileImageAnh = async ({ file, onSuccess, onError }) => {
        try {
            const res = await uploadImg(file);
        
            if (!res || !res.data || !res.data.url) {
                throw new Error("Không có url trong phản hồi từ server.");
            }
        
            const { url, type, public_id } = res.data;
        
            // Gán lại cho Ant Design Upload hiển thị ảnh preview
            file.url = url;
            file.public_id = public_id; // 👈 Gắn vào file để có thể xóa

            // setImageUrl(url);
            setImageUrlAnh({ url, public_id });

            // ✅ Cập nhật fileList cho Upload để hiển thị ảnh mới
            setFileListAnh([
                {
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    url: url,
                    public_id: public_id,
                },
            ]);
        
            onSuccess({
                url,
                public_id, // 👈 thêm dòng này để Upload giữ lại
                type,
            });
        } catch (error) {
            console.error("Lỗi upload:", error);
            onError(error);
        }
    };
    // xóa ảnh cloudinary
    const handleRemoveFile = async (file, type) => {
        try {
            const public_id = file.public_id;
            console.log("public_id: ", public_id);
            
    
            if (public_id) {
                await deleteImg(public_id); // Gọi API xóa ảnh ở server
                message.success("Xoá ảnh thành công");
            }
    
            if (type === "thumbnail") {
                setImageUrl(""); // hoặc setImageUrl(null);
            }
            if (type === "thumbnail2") {
                setImageUrlAnh(""); // hoặc setImageUrl(null);
            }
           
        } catch (error) {
            console.error("Lỗi khi xoá ảnh:", error);
            message.error("Xoá ảnh thất bại");
        }
    };

    // upload ảnh    
    const handleUploadFileImage1 = async ({ file, onSuccess, onError }) => {        
        setLoading(true);
        try {
            const res = await uploadImg(file);
            console.log("res upload: ", res);
            console.log("res upload: ", res.url);
            if (res) {
                // Lấy tên tệp từ URL
                const fileName = res.url.split("/").pop(); // Tách phần cuối của URL để lấy tên tệp

                const fileId = extractDriveFileId(res.url);
                const image = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

                console.log("image: ", image);

                // Tạo một đối tượng mới với tên tệp đã sửa
                const updatedFile = [
                    {
                        uid: file.uid, // Giữ lại uid
                        name: image, // Cập nhật name với tên tệp mới
                        status: "done", // Trạng thái là 'done'
                        url: image, // URL của ảnh
                    },
                ];

                setImageUrl(image); // URL của hình ảnh từ server
                onSuccess(file);
                setFileList(updatedFile);
            } else {
                onError("Đã có lỗi khi upload file");
            }
        } catch (error) {
            console.error(error);
            message.error("Upload thất bại");
            onError(error);
        } finally {
            setLoading(false);
        }

    };
    const handleUploadFileImageAnh1 = async ({ file, onSuccess, onError }) => {
        setLoading(true);
        try {
            const res = await uploadImg(file);
            console.log("res upload: ", res);
            console.log("res upload: ", res.url);
            if (res) {
                // Lấy tên tệp từ URL
                const fileName = res.url.split("/").pop(); // Tách phần cuối của URL để lấy tên tệp

                const fileId = extractDriveFileId(res.url);
                const image = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

                console.log("image: ", image);

                // Tạo một đối tượng mới với tên tệp đã sửa
                const updatedFile = [
                    {
                        uid: file.uid, // Giữ lại uid
                        name: image, // Cập nhật name với tên tệp mới
                        status: "done", // Trạng thái là 'done'
                        url: image, // URL của ảnh
                    },
                ];

                setImageUrlAnh(image); // URL của hình ảnh từ server
                onSuccess(file);
                setFileListAnh(updatedFile);
            } else {
                onError("Đã có lỗi khi upload file");
            }
        } catch (error) {
            console.error(error);
            message.error("Upload thất bại");
            onError(error);
        } finally {
            setLoading(false);
        } 
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên hình ảnh JPG/PNG!');
        }
        return isJpgOrPng;
    };

    const handleChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`upload file ${info.file.name} thành công`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} upload file thất bại!`);
        }
    };

    const handleRemoveFile2 = (file) => {
        setFileList([]); // Reset fileList khi xóa file
        setImageUrl(''); // Reset URL khi xóa file
        message.success(`${file.name} đã được xóa`);
    };
    const handleRemoveFile1 = async (file, type) => {
        const uid = extractDriveThumbnailIdAndSz(imageUrl);
        const response = await deleteImg(uid);
        if (type === "thumbnail") {
            setImageUrl("");
            message.success(`${file.name} đã được xóa`);
        }
        if (type === "thumbnail2") {
            setImageUrlAnh("");
            message.success(`${file.name} đã được xóa`);
        }        
    };
    
    const handleRemoveFileAnh = (file) => {
        setFileListAnh([]); // Reset fileList khi xóa file
        setImageUrlAnh('')
        message.success(`${file.name} đã được xóa`);
    };

    // mở đóng modal hình ảnh
    const handlePreview = async (file) => {
        setImageUrl(file.url); // Lấy URL của hình ảnh
        setIsModalVisible(true); // Mở modal
    };
    const handlePreviewAnh = async (file) => {
        setImageUrlAnh(file.url); // Lấy URL của hình ảnh
        setIsModalVisibleAnh(true); // Mở modal
    };
    console.log("==> imageUrl:", imageUrl);
    console.log("--> imageUrlAnh:", imageUrlAnh);
    

    return (
        <Modal
            title="Sửa thông tin thể loại"
            open={openUpdateTL}
            onOk={() => form.submit()} 
            onCancel={() => handleCancel()}
            maskClosable={false}
            confirmLoading={isSubmit}
            okText={"Xác nhận sửa"}
            cancelText="Huỷ"
        >
            <Divider />
                <Form
                    form={form}
                    name="basic"        
                    layout="vertical"                
                    style={{
                        maxWidth: "100%",
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={handleUpdateTL}
                    autoComplete="off"
                    loading={isSubmit}
                >
                    <Row gutter={[20,5]}>
                        <Col hidden>
                            <Form.Item
                                hidden
                                labelCol={{ span: 24 }}
                                label="ID"
                                name="_id"
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={24} md={24} sm={24} xs={24}>
                            <Form.Item
                                hasFeedback
                                layout="vertical"
                                label="Tên thể loại"
                                name="TenLoaiSP"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập đầy đủ thông tin!',
                                    },
                                ]}
                            >
                            <Input placeholder="Nhập thể loại..." />
                            </Form.Item>
                        </Col>

                        <Col span={12} md={12} sm={12} xs={24} >
                            <Form.Item
                                label="Icon Thể loại"
                                name="Icon"                            
                            >
                                <Upload
                                        name="file"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        maxCount={1}
                                        multiple={false}
                                        customRequest={handleUploadFileImage}
                                        beforeUpload={beforeUpload}
                                        onChange={handleChange}
                                        onRemove={(file) =>
                                            handleRemoveFile(file, "thumbnail")
                                        }
                                        fileList={fileList || []} // Gán danh sách file
                                        onPreview={handlePreview}
                                    >
                                        <div>
                                            {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>

                                    <Modal
                                        visible={isModalVisible}
                                        footer={null}
                                        title="Xem Hình Ảnh"
                                        onCancel={() => setIsModalVisible(false)}
                                    >
                                        <img alt="Uploaded" style={{ width: '100%' }} src={imageUrl} />
                                    </Modal>
                            </Form.Item>
                        </Col>

                        <Col span={12} md={12} sm={12} xs={24} >
                            <Form.Item
                                label="Hình ảnh hiển thị"
                                name="Image"                            
                            >
                                <Upload
                                        name="file" // Tên trùng với multer
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        maxCount={1}
                                        multiple={false}
                                        customRequest={handleUploadFileImageAnh}
                                        beforeUpload={beforeUpload}
                                        onChange={handleChange}
                                        onRemove={(file) =>
                                            handleRemoveFile(file, "thumbnail2")
                                        }
                                        fileList={fileListAnh || []} 
                                        onPreview={handlePreviewAnh} // Sử dụng onPreview
                                    >
                                        <div>
                                            {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                </Upload>    

                                <Modal
                                    visible={isModalVisibleAnh}
                                    title="Xem Hình Ảnh"
                                    footer={null}
                                    onCancel={() => setIsModalVisibleAnh(false)}
                                >
                                    <img height={550} alt="image" style={{ width: '100%' }} src={imageUrlAnh} />
                                </Modal>                           
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>
            
        </Modal>
    )
}
export default Update