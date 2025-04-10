import axios from "../utils/axios-customize"

export const fetchAllTheLoai = (query) => {
    const URL_BACKEND = `/api/category/get-the-loai?${query}`    
    return axios.get(URL_BACKEND)
}

export const createTheLoai = (TenLoaiSP, Icon, Image) => {
    return axios.post('/api/category/create-the-loai', {
        TenLoaiSP, Icon, Image
    })
}

export const deleteTheLoai = (id) => {
    return axios.delete(`/api/category/delete-the-loai/${id}`)
}

export const updateTheLoai = (_id, TenLoaiSP, Icon, Image) => {
    return axios.put('/api/category/update-the-loai', {
        _id, TenLoaiSP, Icon, Image
    })
}