from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from commons.middlewares.exception import APIException
from commons.applibs.response import prepare_error_response, prepare_success_response, serializer_error_response

from organizational_structure.serializer import ChartSerializer, CreateNodeSerializer, UpdateNodeSerializer, DeleteNodeSerializer
from organizational_structure.service import OrganizationalStructureService

class NodeView(APIView) :
    permission_classes = [IsAuthenticated,]

    def __init__(self) :
        self.node_serializer = UpdateNodeSerializer
        self.delete_node_serializer = DeleteNodeSerializer
        self.chart_serializer = ChartSerializer
        self.service = OrganizationalStructureService

    def put(self, request, id) :
        try :
            serializer = self.node_serializer(data=request.data)
            if(not serializer.is_valid()) :
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)
            self.service.update_nodes(id, **serializer.data)
            return Response(prepare_success_response(serializer.data), status.HTTP_201_CREATED)
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChildNodeView(APIView) :
    permission_classes = [IsAuthenticated,]

    def __init__(self) :
        self.node_serializer = CreateNodeSerializer
        self.chart_serializer = ChartSerializer
        self.service = OrganizationalStructureService

    def post(self, request, chart_id) :
        try :
            serializer = self.node_serializer(data=request.data)
            if(not serializer.is_valid()) :
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)
            chart = self.service.create_child_node(chart_id, **serializer.data)
            serializer_data = self.chart_serializer(chart).data
            return Response(prepare_success_response(serializer_data), status.HTTP_201_CREATED)
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

class OffsetChildNodeView(APIView) :
    permission_classes = [IsAuthenticated,]

    def __init__(self) :
        self.node_serializer = CreateNodeSerializer
        self.chart_serializer = ChartSerializer
        self.service = OrganizationalStructureService

    def post(self, request, chart_id) :
        try :
            serializer = self.node_serializer(data=request.data)
            if(not serializer.is_valid()) :
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)

            chart = self.service.create_child_offsets_node(chart_id, **serializer.data)
            serializer_data = self.chart_serializer(chart).data
            return Response(prepare_success_response(serializer_data), status.HTTP_201_CREATED)
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

