UCLASS()
class ATHEHIVEGameModeBase : public AGameModeBase {
    GENERATED_BODY()
public:
    virtual void StartPlay() override;
    UFUNCTION(BlueprintCallable) void SwitchWorld(APlayerController* Player, const FString& WorldName);
    UFUNCTION(BlueprintCallable) void SpawnPlayer(APlayerController* Player, const FVector& Location);
};
