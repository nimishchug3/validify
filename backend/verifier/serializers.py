from rest_framework import serializers

class SSCMarksheetSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    roll_no = serializers.CharField(required=True)
    result = serializers.CharField(required=True)
    document_file = serializers.FileField(required=True)

class CETMarksheetSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    roll_no = serializers.CharField(required=True)
    application_no = serializers.CharField(required=True)
    category = serializers.CharField(required=True)
    mothers_name = serializers.CharField(required=True)
    document_file = serializers.FileField(required=True)

class DomicileCertificateSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    certificate_number = serializers.CharField(required=True)
    state = serializers.CharField(required=True)
    document_file = serializers.FileField(required=True)