from django.core.paginator import Paginator

def pagination(data, limit=8, page=1) :
    data_paginator = Paginator(data, limit)
    data_page = data_paginator.page(page)

    data = {
            "result" : data_page,
            "meta" : {
                "total_pages" : data_paginator.num_pages,
                "current_page" : page,
                "limit" : limit,
                "total_item" : data_paginator.count,
                "has_next" : data_page.has_next(),
                "has_previous" : data_page.has_previous(),
            }
    }
    return data