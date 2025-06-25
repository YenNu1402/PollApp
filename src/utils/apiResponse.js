class ApiResponse {
  static success(message, data = null, meta = null) {
    const response = {
      success: true,
      message
    };

    if (data) {
      response.data = data;
    }

    if (meta) {
      response.meta = meta;
    }

    return response;
  }

  static error(message, errors = null, code = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    if (code) {
      response.code = code;
    }

    return response;
  }

  //Phản hồi phân trang
  static paginate(data, page, limit, total) {
    return {
      success: true,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export default ApiResponse; 