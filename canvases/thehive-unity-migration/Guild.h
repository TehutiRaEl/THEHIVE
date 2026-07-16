UCLASS()
class AGuild : public AActor {
    GENERATED_BODY()
public:
    UPROPERTY(Replicated, BlueprintReadWrite) FString GuildId;
    UPROPERTY(Replicated, BlueprintReadWrite) FString Name;
    UPROPERTY(Replicated, BlueprintReadWrite) FString Tag;
    UPROPERTY(Replicated, BlueprintReadWrite) FString LeaderId;
    UPROPERTY(Replicated, BlueprintReadWrite) TArray<FString> Members;
    UPROPERTY(Replicated, BlueprintReadWrite) TArray<FString> Officers;
    UPROPERTY(Replicated, BlueprintReadWrite) FString CastleId;

    UFUNCTION(BlueprintCallable) void AddMember(const FString& UserId);
    UFUNCTION(BlueprintCallable) void ClaimTerritory(const FString& TerritoryId);
    UFUNCTION(BlueprintCallable) void BuildCastle(const FVector& Location);
};
